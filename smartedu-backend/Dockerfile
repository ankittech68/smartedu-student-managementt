FROM maven:3.9.6-eclipse-temurin-17

WORKDIR /app

COPY . .

RUN mvn clean package -DskipTests

EXPOSE 9999

CMD ["java", "-jar", "target/smartedu-backend-0.0.1-SNAPSHOT.jar"]