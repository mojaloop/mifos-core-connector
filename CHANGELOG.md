# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.3.0](https://github.com/mojaloop/mifos-core-connector/compare/v1.2.0...v1.3.0) (2024-05-31)


### Features

* added account check for blocked credit or blocked debit ([353ad27](https://github.com/mojaloop/mifos-core-connector/commit/353ad279f915e68945b0cf0ed05db983613ee9ab))

## [1.2.0](https://github.com/mojaloop/mifos-core-connector/compare/v1.1.0...v1.2.0) (2024-05-27)


### Features

* add error definitions and types ([dea630d](https://github.com/mojaloop/mifos-core-connector/commit/dea630db7f5f38d541ab6dec52315fb47cad401a))
* added a base routes class to hold common methods and create a dfsp routes class ([c5b14a8](https://github.com/mojaloop/mifos-core-connector/commit/c5b14a8a77e7ba3ecadaa398a2b729179ce5fe4d))
* added checks for missing payeeFspFee and payeeFspCommission ([851b29f](https://github.com/mojaloop/mifos-core-connector/commit/851b29ff2fa72421f6630c84c3013f9b9f050df1))
* added config vars descriptions ([f9402c5](https://github.com/mojaloop/mifos-core-connector/commit/f9402c5a928ddb417ccda21258b1e7903513f348))
* added configuration variables to be used during service startup ([cefd72c](https://github.com/mojaloop/mifos-core-connector/commit/cefd72c8329020c80c2cea69597b925df37ab9d8))
* added custom error handling logic for failed refunds ([37efe3a](https://github.com/mojaloop/mifos-core-connector/commit/37efe3aabab30e77ed731c70c4b2273d50e932d2))
* added process management code to src/index.ts ([8eab282](https://github.com/mojaloop/mifos-core-connector/commit/8eab282cc9486627818fd2252c3b517e5c413c50))
* added process management code to src/index.ts ([5640405](https://github.com/mojaloop/mifos-core-connector/commit/5640405e71e581246a86feb45c1c27615c401055))
* added types to support functions ([2622086](https://github.com/mojaloop/mifos-core-connector/commit/262208685f2bb5ec992b35dbb2afd0b221a0a809))
* check fineract account allowed to deposit and withdraw ([305c63c](https://github.com/mojaloop/mifos-core-connector/commit/305c63c85fc41fbaecb806660d4b29e717c1eddd))
* check fineract account allowed to deposit and withdraw ([097d242](https://github.com/mojaloop/mifos-core-connector/commit/097d242c28e2919af34808cf6c5d1626a19cdedf))
* created api specification for the sdk inbound requests to the core connector ([5d2e18b](https://github.com/mojaloop/mifos-core-connector/commit/5d2e18b3451f5180c17da8ad5e66f37433dc3627))
* created SDK Scheme Adapter client to support communication with the scheme adapter ([c34be0e](https://github.com/mojaloop/mifos-core-connector/commit/c34be0efb879ec16423e3f0e6e8a3be7b0087f02))
* fixed code formating with prettier ([2b63015](https://github.com/mojaloop/mifos-core-connector/commit/2b6301531bec11b2a34c912638abd05bd8a02408))
* fixed fineract client to support core connector aggregate ([5e71404](https://github.com/mojaloop/mifos-core-connector/commit/5e714047564b4476dd8af7c8192f47ca8853d912))
* handle possible failed of getTransactions function during refund ([bf6180c](https://github.com/mojaloop/mifos-core-connector/commit/bf6180c34d0fe82afecce4a79473b3e65e25e336))
* implemented confguration for payment Type Id ([04dbcf8](https://github.com/mojaloop/mifos-core-connector/commit/04dbcf8ca14af286965fcbfef8c4d976185b0a9e))
* log service start refactor ([e10c60d](https://github.com/mojaloop/mifos-core-connector/commit/e10c60dfd45d8fe23aa49ad4dd45c46f0988deb5))
* refactor to allow for better exception handling ([c860199](https://github.com/mojaloop/mifos-core-connector/commit/c8601996feaa8af65969c856f5e8bda685cf75cb))
* refactor to check for account active at quote stage ([bf6ce98](https://github.com/mojaloop/mifos-core-connector/commit/bf6ce985e1bc96cda0845a38caa28049ce7ab08d))
* update aggregate with new functions for payment initiation ([af9016f](https://github.com/mojaloop/mifos-core-connector/commit/af9016fcf2bad851935885b86b9d6e38fc79e1ef))
* updated domain interfaces with types to support the fineract client and SDK Client ([124a498](https://github.com/mojaloop/mifos-core-connector/commit/124a4988ae783f171bc8d124e2e2ed28f12a57c4))
* updated environment configuration files ([d655f19](https://github.com/mojaloop/mifos-core-connector/commit/d655f1929989bf7fe481c21e046d43157345dba4))
* updated fineract client with funds withdraw functionality ([c432031](https://github.com/mojaloop/mifos-core-connector/commit/c43203179c51d1caeb48381db7bd2ccf5d2ce4b1))
* updated request body in PUT /transfers/{transferId} ([c1afae1](https://github.com/mojaloop/mifos-core-connector/commit/c1afae1be532c88395d4af1f71800f03cf40d283))


### Bug Fixes

* added linting in pre-commit and fixed lint errors ([b2bcd1c](https://github.com/mojaloop/mifos-core-connector/commit/b2bcd1c560f68fc5785dcb1a7d400ad3668ebea7))
* fix dfsp server failing to stop in tests ([297ccea](https://github.com/mojaloop/mifos-core-connector/commit/297cceaff833aa5a78f81cac144a542fd60d13f0))
* fix failing test cases ([761aee4](https://github.com/mojaloop/mifos-core-connector/commit/761aee46f596dfb6b828cba47314f7d70ab22580))
* fix linting shorten import statement ([e257d3e](https://github.com/mojaloop/mifos-core-connector/commit/e257d3ef2637cbd794b3fbb0dc8c64ce39a32e4d))
* fixed code formatting ([6e2b3fa](https://github.com/mojaloop/mifos-core-connector/commit/6e2b3fafd5dac168146ffdd3d3e0c2653c2485dc))
* fixed code formatting and environment variable naming ([aa1b7d3](https://github.com/mojaloop/mifos-core-connector/commit/aa1b7d33dc3ca9510a94ad831bf289080a6aa774))
* fixed docker compose build context to current dir ([a6f000d](https://github.com/mojaloop/mifos-core-connector/commit/a6f000dd3f769293dda7224dacb7e3ffafdd6cc2))
* fixed errors in core connector aggregate ([0ada7af](https://github.com/mojaloop/mifos-core-connector/commit/0ada7af7002d99ec1c316e2c8b08bee779d740b4))
* fixed errors in http api svc ([1731ec6](https://github.com/mojaloop/mifos-core-connector/commit/1731ec6450cae343aba37b1057a854a5c685651f))
* fixed functional errors in fineract client ([ae673b6](https://github.com/mojaloop/mifos-core-connector/commit/ae673b65e859af9f724a1355dd27bb9c041edf3d))
* fixed functional errors in sdk client ([adf6ad0](https://github.com/mojaloop/mifos-core-connector/commit/adf6ad0bf157cfcaf0059fd76e0a1fdf8a9edd44))
* fixed import in logger.ts ([f7c6cea](https://github.com/mojaloop/mifos-core-connector/commit/f7c6cea15f4aae386df2aa8d4bae5c0257cd74b0))
* move fineract test file to integration tests ([2a7f0dd](https://github.com/mojaloop/mifos-core-connector/commit/2a7f0dd53dc659a36fb06de6872cfc3e5c9323eb))
* remove duplicated code ([aa5ffa2](https://github.com/mojaloop/mifos-core-connector/commit/aa5ffa2d7899fc75b5bb1c62084dd7a76b660f06))
* remove duplicated logic ([bab7116](https://github.com/mojaloop/mifos-core-connector/commit/bab711683cd5801f0b279a2c05dace74503b3632))
* remove uneeded type conversion ([48a3a88](https://github.com/mojaloop/mifos-core-connector/commit/48a3a880f4a5b4eaa9b7a172b82150c2cca357e7))
* synchronize api response fixes [#15](https://github.com/mojaloop/mifos-core-connector/issues/15) ([b8aafc4](https://github.com/mojaloop/mifos-core-connector/commit/b8aafc4c5f5f5bb19c7ee6d308b2295105c9bbcd))
* synchronize api response schema with actual response codes ([255a411](https://github.com/mojaloop/mifos-core-connector/commit/255a411dc3bb6da13a2292dda7a3ddce265ee191))
* update packages in package.json ([f1f0dda](https://github.com/mojaloop/mifos-core-connector/commit/f1f0ddadec3a7063e41eadeb50c98345c8ca4bdf))
* update packages in package.json ([ad39957](https://github.com/mojaloop/mifos-core-connector/commit/ad399579adc715003df71eea14f9250662cc4d26))
* updated environment examples and added docker compose file ([af7d59a](https://github.com/mojaloop/mifos-core-connector/commit/af7d59aaeffc94ea898473b05f1aafc0ed6d3400))
* updated httpClient to use a new interface ([c43d21c](https://github.com/mojaloop/mifos-core-connector/commit/c43d21ce6265fb7a73496fa41696e3b1a86b0770))
* use named constants instead of magic numbers ([27c8613](https://github.com/mojaloop/mifos-core-connector/commit/27c8613a142848b63ecd3811a00c96e706361aae))
* use named constants instead of magic numbers ([c579c6b](https://github.com/mojaloop/mifos-core-connector/commit/c579c6be500603cb16d1da1a9627ad9a8f39cd51))

## [1.1.0](https://github.com/mojaloop/mifos-core-connector/compare/v0.0.12...v1.1.0) (2024-04-12)


### Features

* code quality enhancements ([5a84f76](https://github.com/mojaloop/mifos-core-connector/commit/5a84f76f2f2fc675094c4217b6a38b3f17fb9973))


### Bug Fixes

* fixed failing test cases ([6d105ee](https://github.com/mojaloop/mifos-core-connector/commit/6d105eec27d0c142c94bf5b1958f70bff7fb4a86))

### [0.0.12](https://github.com/mojaloop/mifos-core-connector/compare/v0.0.11...v0.0.12) (2024-03-25)


### Bug Fixes

* validate account returned from IBAN to have length > 1 ([122eb88](https://github.com/mojaloop/mifos-core-connector/commit/122eb88515108aad3f34b9fd91016ea132920f02))

### [0.0.11](https://github.com/mojaloop/mifos-core-connector/compare/v0.0.10...v0.0.11) (2024-03-25)

### [0.0.10](https://github.com/mojaloop/mifos-core-connector/compare/v0.0.9...v0.0.10) (2024-03-25)


### Bug Fixes

* removed undefined optional fields from response bodies in quotes and transfers ([cd523e4](https://github.com/mojaloop/mifos-core-connector/commit/cd523e4bb2c8c2ad18f749f32e68dbb3683efb15))

### [0.0.9](https://github.com/mojaloop/mifos-core-connector/compare/v0.0.8...v0.0.9) (2024-03-25)


### Bug Fixes

* make merchantClassificationCode optional in get parties response ([a1349e0](https://github.com/mojaloop/mifos-core-connector/commit/a1349e0b8b59ac26c0d9a11ce464d4c10966d5a2))

### [0.0.8](https://github.com/mojaloop/mifos-core-connector/compare/v0.0.7...v0.0.8) (2024-03-25)


### Features

* make fspId, DateOfBirth and extensionList optional in get parties response ([2ea3f84](https://github.com/mojaloop/mifos-core-connector/commit/2ea3f841ea0691092ada39e6443cfea474732283))


### Bug Fixes

* removed extension list from Get parties response ([ca7c228](https://github.com/mojaloop/mifos-core-connector/commit/ca7c228dba7419a6fd009dc32c9c69185236647b))

### [0.0.7](https://github.com/mojaloop/mifos-core-connector/compare/v0.0.6...v0.0.7) (2024-03-25)


### Bug Fixes

* made some fields optional ([1a7c2bf](https://github.com/mojaloop/mifos-core-connector/commit/1a7c2bf26582c45e5a54cb78cdd524f4b5af5cb0))

### [0.0.6](https://github.com/mojaloop/mifos-core-connector/compare/v0.0.5...v0.0.6) (2024-03-25)


### Bug Fixes

* removed supported currencies and idsubvalue in response ([d943f0d](https://github.com/mojaloop/mifos-core-connector/commit/d943f0d6976e73f55a02c68d1165c1389531ed0d))

### [0.0.5](https://github.com/mojaloop/mifos-core-connector/compare/v0.0.4...v0.0.5) (2024-03-25)

### [0.0.4](https://github.com/mojaloop/mifos-core-connector/compare/v0.0.3...v0.0.4) (2024-03-22)


### Features

* implemented tests for transfers ([0283c7c](https://github.com/mojaloop/mifos-core-connector/commit/0283c7c09e0bcc908a396d5c4f16826f782932bd))
* implemented transfers function ([5ffbfb7](https://github.com/mojaloop/mifos-core-connector/commit/5ffbfb72eba28e1e1856fcd1653c063324838d5a))
* implemented transfers function routes ([6a36bd9](https://github.com/mojaloop/mifos-core-connector/commit/6a36bd942e2d8553d04a406b80e899c456aab476))

### [0.0.3](https://github.com/mojaloop/mifos-core-connector/compare/v0.0.2...v0.0.3) (2024-03-22)


### Features

* added types and functions to calculate quotes from fineract ([a8ea7d9](https://github.com/mojaloop/mifos-core-connector/commit/a8ea7d93ae2df2ac2c66d7193f995a84a569e70a))
* added types and functions to calculate quotes in core aggregate ([801d4ad](https://github.com/mojaloop/mifos-core-connector/commit/801d4ad62a3792b89bd78ebac886a18a68718965))
* finished implementing quoterequests function ([3320007](https://github.com/mojaloop/mifos-core-connector/commit/33200076bb4c664f322ea205606f6fbd1aa3c8cd))
* implemented routes to register /quoterequests ([2d6cdd7](https://github.com/mojaloop/mifos-core-connector/commit/2d6cdd7b62cb2a2bb699bb0488b3129e31943e08))

### [0.0.2](https://github.com/mojaloop/mifos-core-connector/compare/v1.1.3...v0.0.2) (2024-03-22)

### 1.1.3 (2024-03-22)


### Bug Fixes

* added pre-commit hook in .husky ([38f89f4](https://github.com/mojaloop/mifos-core-connector/commit/38f89f41a3c5390e55f4c180130adc1cf3999e0d))
* updated dependencies ([574c56d](https://github.com/mojaloop/mifos-core-connector/commit/574c56db683d8d82577e64d1543f2ea7b36cc321))
