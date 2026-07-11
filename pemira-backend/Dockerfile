# ── Build stage ────────────────────────────────────────────────────────────
# Pakai Maven Wrapper yang sudah di-commit, JDK 17 (ADR-008).
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Cache dependency: salin pom + wrapper dulu, resolve, baru salin sumber.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw -q -B dependency:go-offline

COPY src/ src/
RUN ./mvnw -q -B clean package -DskipTests

# ── Runtime stage ──────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre AS runtime
WORKDIR /app

# Jalankan sebagai non-root.
RUN useradd -r -u 1001 pemira
USER pemira

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod
# Batasi heap agar aman di VPS kecil; sesuaikan bila perlu.
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
