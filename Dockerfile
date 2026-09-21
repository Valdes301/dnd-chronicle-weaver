# ==========================================
# Fase 1: Dipendenze e compilazione C++ (better-sqlite3)
# ==========================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copia i file di dipendenza e installa in modo pulito e deterministico
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit --no-fund

# ==========================================
# Fase 2: Build dell'applicazione Next.js
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ==========================================
# Fase 3: Runner di produzione (Ultra-leggero e ottimizzato per RPi 4)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

# Librerie C++ di runtime necessarie per better-sqlite3 e dumb-init per gestione sicura dei segnali PID 1
RUN apk add --no-cache libc6-compat libstdc++ dumb-init

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Crea un utente di sistema non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Crea e assegna i permessi alle directory persistenti prima del cambio utente
RUN mkdir -p /app/data /app/data/assets && \
    chown -R nextjs:nodejs /app/data

# Copia gli asset statici e il pacchetto standalone generato da Next.js
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Avvio con dumb-init per arresto e riavvio immediato senza zombie process
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]

