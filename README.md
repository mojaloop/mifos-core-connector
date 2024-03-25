# Mifos Core Connector

[![Git Releases](https://img.shields.io/github/release/mojaloop/mifos-core-connector.svg?style=flat)](https://github.com/mojaloop/mifos-core-connector/releases)
[![CircleCI](https://circleci.com/gh/mojaloop/mifos-core-connector.svg?style=svg)](https://circleci.com/gh/mojaloop/mifos-core-connector)


# Overview
A connector that facilitates payments between a Mojaloop Connector (SDK Scheme Adapter) and a Core Banking system
> This project is still in development

# Running the project

To run the project clone the repository into your local machine 

```bash
git clone https://github.com/mojaloop/mifos-core-connector.git
```


Change directory into the project folder

```bash
cd mifos-core-connector
```

# Set node version

```bash
nvm use
```

# Install dependencies

```bash
npm install
```

# Build 
```bash
npm run build
```

# Run 
```bash
npm run start
```

# Functional Tests

```bash
npm run test:functional
```
# Unit Tests

```bash
npm run test:unit
```
# Build and Run

```bash
npm run start:build
```
# Run with Docker

```bash
docker compose -f ./test/func/docker-compose.yml up -d
```
# Tear down Docker

```bash
docker compose -f ./test/func/docker-compose.yml down
```