FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests || mvn clean package -DskipTests
EXPOSE 9999
CMD ["java", "-jar", "target/smartedu-backend-0.0.1-SNAPSHOT.jar"]