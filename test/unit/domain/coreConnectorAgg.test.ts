/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * Eugen Klymniuk <eugen.klymniuk@infitx.com>
 --------------
 **********/

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import {CoreConnectorAggregate, TQuoteRequest, ValidationError} from '../../../src/domain';
import { FineractClientFactory, FineractError, IFineractClient } from '../../../src/domain/FineractClient';
import {
    ISDKClient,
    SDKClientError,
    SDKClientFactory,
    TFineractOutboundTransferRequest,
} from '../../../src/domain/SDKClient';
import { AxiosClientFactory } from '../../../src/infra/axiosHttpClient';
import { loggerFactory } from '../../../src/infra/logger';
import config from '../../../src/config';
import * as fixtures from '../../fixtures';
import * as crypto from 'node:crypto';
import {
    fineractCalculateWithdrawQuoteResponseDto,
    fineractGetSavingsAccountResponseDto,
    getPatchNotificationBody,
    getSendTransferRequestBody,
    invalidIBANTransfer,
    invalidQuoteTransfer, postTransfersSuccessfulResponseDto,
    sdkInitiateTransferResponseDto,
    validTransfer,
} from '../../fixtures';

const mockAxios = new MockAdapter(axios);
const logger = loggerFactory({ context: 'ccAgg tests' });
const fineractConfig = config.get('fineract');
const SDK_URL = 'http://localhost:4040';
const IBAN = 'UG680720000289000000006';

describe('CoreConnectorAggregate Tests -->', () => {
    let ccAggregate: CoreConnectorAggregate;
    let fineractClient: IFineractClient;
    let sdkClient: ISDKClient;

    beforeEach(() => {
        mockAxios.reset();
        const httpClient = AxiosClientFactory.createAxiosClientInstance();
        sdkClient = SDKClientFactory.getSDKClientInstance(logger, httpClient, SDK_URL);
        fineractClient = FineractClientFactory.createClient({
            fineractConfig,
            httpClient,
            logger,
        });
        ccAggregate = new CoreConnectorAggregate(fineractConfig, fineractClient, sdkClient, logger);
    });

    describe('updateSentTransfer Method Tests -->', () => {
        beforeEach(() => {
            fineractClient.getSavingsAccount = jest.fn().mockResolvedValue({
                statusCode: 200,
                data: fixtures.fineractGetAccountResponseDto(),
            });
            fineractClient.sendTransfer = jest.fn().mockResolvedValue({
                statusCode: 200,
                data: fixtures.fineractTransactionResponseDto(),
            });
        });

        test('should re-throw SDKClientError if sdkClient.updateTransfer() fails', async () => {
            fineractClient.receiveTransfer = jest.fn().mockResolvedValue({
                statusCode: 200,
            });
            const httpCode = 500;
            mockAxios.onAny().reply(httpCode, {}); // mocking sdkClient.updateTransfer() failure

            try {
                await ccAggregate.updateSentTransfer(fixtures.transferAcceptDto());
                throw new Error('Test failed');
            } catch (err) {
                expect(err).toBeInstanceOf(SDKClientError);
                expect((err as SDKClientError)?.httpCode).toBe(httpCode);
            }
        });

        test('should re-throw refundFailedError if fineractClient.receiveTransfer() fails', async () => {
            fineractClient.receiveTransfer = jest.fn().mockResolvedValue({
                statusCode: 500,
            });

            const transferAccept = fixtures.transferAcceptDto();
            try {
                await ccAggregate.updateSentTransfer(transferAccept);
                throw new Error('Test failed');
            } catch (err: unknown) {
                expect(err).toBeInstanceOf(ValidationError);
                const refundFailedError = ValidationError.refundFailedError({
                    amount: transferAccept.fineractTransaction.totalAmount,
                    fineractAccountId: transferAccept.fineractTransaction.fineractAccountId,
                });
                expect(err).toEqual(refundFailedError);
            }
        });
    });

    describe('Payee getParties Tests -->', () => {
        beforeEach(() => {
            fineractClient.lookupPartyInfo = jest.fn().mockResolvedValue({
                statusCode: 200,
                data: fixtures.fineractLookUpPartyResponseDto(),
            });
        });

        test('should return 400 if request has incorrect parameters', async ()=>{
            try{
                await ccAggregate.getParties('UG0000000008892343',"MSISDN");
            }catch(err: unknown){
                if(err instanceof ValidationError){
                    expect(err.httpCode).toEqual(400);
                }
            }
        });

        test('should return 400 if IBAN string is poorly formatted', async ()=>{
            try{
                await ccAggregate.getParties('UG008892343',"IBAN");
            }catch(err: unknown){
                if(err instanceof ValidationError){
                    expect(err.httpCode).toEqual(400);
                }
            }
        });

        test('should return http code 500 and Mojaloop Code 5000 if fineract search for account fails', async ()=>{
            fineractClient.searchAccount = jest.fn().mockResolvedValue({
                statusCode: 500
            });

            try{
                await ccAggregate.getParties('UG0000000008892343',"IBAN");
            }catch(err: unknown){
                if(err instanceof ValidationError){
                    expect(err.httpCode).toEqual(500);
                    expect(err.mlCode).toEqual('5000');
                }
            }
        });

        test('should return http code 500 and Mojaloop Code 5000 if fineract getAccount by Id for account fails', async ()=>{
            fineractClient.getSavingsAccount = jest.fn().mockResolvedValue({
                statusCode: 500
            });

            try{
                await ccAggregate.getParties('UG0000000008892343',"IBAN");
            }catch(err: unknown){
                if(err instanceof ValidationError){
                    expect(err.httpCode).toEqual(500);
                    expect(err.mlCode).toEqual('5000');
                }
            }
        });

        test('should return http code 404 and Mojaloop Code 5107 if returned fineract account is not active', async ()=>{
            fineractClient.getSavingsAccount = jest.fn().mockResolvedValue({
                statusCode: 200,
                data: {
                    status:{
                        active: false
                    }
                }
            });
            try{
                await ccAggregate.getParties('UG0000000008892343',"IBAN");
            }catch(err: unknown){
                if(err instanceof ValidationError){
                    expect(err.httpCode).toEqual(404);
                    expect(err.mlCode).toEqual('5107');
                }
            }
        });

        test('should return http code 404 and Mojaloop Code 5107 if fineract search for account returns no account', async ()=>{
            fineractClient.searchAccount = jest.fn().mockResolvedValue({
                statusCode: 200,
                data:[]
            });

            try{
                await ccAggregate.getParties('UG000000000889BXXX',"IBAN");
            }catch(err: unknown){
                if(err instanceof ValidationError){
                    expect(err.httpCode).toEqual(404);
                    expect(err.mlCode).toEqual('5107');
                }
            }
        });

        test('should return http code 500 and Mojaloop Code 5000 if fineract get Client fails',async ()=>{
            fineractClient.getClient = jest.fn().mockResolvedValue({
                statusCode: 500
            });
            try{
                await ccAggregate.getParties('UG0000000008892343',"IBAN");
            }catch(err: unknown){
                if(err instanceof ValidationError){
                    expect(err.httpCode).toEqual(500);
                    expect(err.mlCode).toEqual('5000');
                }
            }
        });

        test('should pass if data fineract.lookUpParty resolves', async () => {
            const lookupRes = await ccAggregate.getParties('UG0000000008892343',"IBAN");
            expect(lookupRes.data.firstName).toEqual('Dove');
        });
    });

    describe('Payee quoteRequest Tests', () => {
        const validQuoteRequestBody : TQuoteRequest =  {
            amount: '1000',
            amountType: 'SEND',
            currency: 'UGX',
            from: {
                dateOfBirth: '2036-10-31',
                displayName: 'string',
                extensionList: [
                    {
                        key: 'string',
                        value: 'string',
                    },
                ],
                firstName: 'string',
                fspId: 'string',
                idSubValue: 'string',
                idType: 'MSISDN',
                idValue: 'string',
                lastName: 'string',
                merchantClassificationCode: 'string',
                middleName: 'string',
                type: 'CONSUMER',
            },
            initiator: 'PAYER',
            initiatorType: 'CONSUMER',
            note: 'string',
            quoteId: 'adbdb5be-d359-300a-bbcf-60d25a2ef3f9',
            subScenario: 'string',
            to: {
                dateOfBirth: '2036-10-31',
                displayName: 'string',
                extensionList: [
                    {
                        key: 'string',
                        value: 'string',
                    },
                ],
                firstName: 'string',
                fspId: 'string',
                idSubValue: 'string',
                idType: 'IBAN',
                idValue: IBAN,
                lastName: 'string',
                merchantClassificationCode: 'string',
                middleName: 'string',
                type: 'CONSUMER',
            },
            transactionId: crypto.randomUUID(),
            transactionType: 'TRANSFER',
        };
        const invalidIdTypeQuoteRequestBody: TQuoteRequest =  {
            amount: '1000',
            amountType: 'SEND',
            currency: 'UGX',
            from: {
                dateOfBirth: '2036-10-31',
                displayName: 'string',
                extensionList: [
                    {
                        key: 'string',
                        value: 'string',
                    },
                ],
                firstName: 'string',
                fspId: 'string',
                idSubValue: 'string',
                idType: 'MSISDN',
                idValue: 'string',
                lastName: 'string',
                merchantClassificationCode: 'string',
                middleName: 'string',
                type: 'CONSUMER',
            },
            initiator: 'PAYER',
            initiatorType: 'CONSUMER',
            note: 'string',
            quoteId: 'adbdb5be-d359-300a-bbcf-60d25a2ef3f9',
            subScenario: 'string',
            to: {
                dateOfBirth: '2036-10-31',
                displayName: 'string',
                extensionList: [
                    {
                        key: 'string',
                        value: 'string',
                    },
                ],
                firstName: 'string',
                fspId: 'string',
                idSubValue: 'string',
                idType: 'MSISDN',
                idValue: IBAN,
                lastName: 'string',
                merchantClassificationCode: 'string',
                middleName: 'string',
                type: 'CONSUMER',
            },
            transactionId: crypto.randomUUID(),
            transactionType: 'TRANSFER',
        };
        const invalidCurrencyQuoteRequestBody: TQuoteRequest =  {
            amount: '1000',
            amountType: 'SEND',
            currency: 'UGX',
            from: {
                dateOfBirth: '2036-10-31',
                displayName: 'string',
                extensionList: [
                    {
                        key: 'string',
                        value: 'string',
                    },
                ],
                firstName: 'string',
                fspId: 'string',
                idSubValue: 'string',
                idType: 'MSISDN',
                idValue: 'string',
                lastName: 'string',
                merchantClassificationCode: 'string',
                middleName: 'string',
                type: 'CONSUMER',
            },
            initiator: 'PAYER',
            initiatorType: 'CONSUMER',
            note: 'string',
            quoteId: 'adbdb5be-d359-300a-bbcf-60d25a2ef3f9',
            subScenario: 'string',
            to: {
                dateOfBirth: '2036-10-31',
                displayName: 'string',
                extensionList: [
                    {
                        key: 'string',
                        value: 'string',
                    },
                ],
                firstName: 'string',
                fspId: 'string',
                idSubValue: 'string',
                idType: 'IBAN',
                idValue: IBAN,
                lastName: 'string',
                merchantClassificationCode: 'string',
                middleName: 'string',
                type: 'CONSUMER',
            },
            transactionId: crypto.randomUUID(),
            transactionType: 'TRANSFER',
        };

        test('test quoteRequest should pass with correct ID Type', async () => {
            fineractClient.verifyBeneficiary = jest.fn().mockResolvedValue({
                statusCode: 200,
                data: fixtures.fineractVerifyBeneficiaryResponseDto(),
                currency: 'UGX'
            });
            const quoteRes = await ccAggregate.quoteRequest(validQuoteRequestBody);
            expect(quoteRes.payeeFspFeeAmount).toEqual('0');
        });

        test('should fail with invalid Id Type in request body', async ()=>{
            try{
                await ccAggregate.quoteRequest(invalidIdTypeQuoteRequestBody);
            }catch(err: unknown){
                if( err instanceof ValidationError){
                    expect(err.mlCode).toEqual('3100');
                    expect(err.httpCode).toEqual(400);
                }
            }
        });

        test('should fail with invalid to.Currency in request body', async ()=>{
            try{
                await ccAggregate.quoteRequest(invalidCurrencyQuoteRequestBody);
            }catch(err: unknown){
                if( err instanceof ValidationError){
                    expect(err.mlCode).toEqual('5106');
                    expect(err.httpCode).toEqual(500);
                }
            }
        });

        test('should return 500 http code and 5000 mojaloop code if search fineract account fails',async ()=>{
            fineractClient.searchAccount = jest.fn().mockResolvedValue({
                statusCode: 500
            });
            try{
                await ccAggregate.quoteRequest(validQuoteRequestBody);
            }catch(err: unknown){
                if(err instanceof ValidationError){
                    expect(err.mlCode).toEqual('5000');
                    expect(err.httpCode).toEqual(500);
                }
            }
        });

        test('should return 500 http code and 5000 mojaloop code if get fineract account fails',async ()=>{
            fineractClient.verifyBeneficiary = jest.fn().mockResolvedValue({
                statusCode: 200,
                data: fixtures.fineractVerifyBeneficiaryResponseDto(),
                currency: 'UGX'
            });
            fineractClient.getSavingsAccount = jest.fn().mockResolvedValue({
                statusCode: 500
            });
            try{
                await ccAggregate.quoteRequest(validQuoteRequestBody);
            }catch(err: unknown){
                if(err instanceof ValidationError){
                    expect(err.mlCode).toEqual('5000');
                    expect(err.httpCode).toEqual(500);
                }
            }
        });

        test('should return http code 500 and 5107 mojaloop code if account is not found',async ()=>{
            fineractClient.searchAccount = jest.fn().mockResolvedValue({
                statusCode: 200,
                data:[]
            });
            try{
                await ccAggregate.quoteRequest(validQuoteRequestBody);
            }catch(err: unknown){
                if(err instanceof ValidationError){
                    expect(err.mlCode).toEqual('5107');
                    expect(err.httpCode).toEqual(500);
                }
            }
        });

        test('should return http code 500 and 5107 mojaloop code if account is not active',async ()=>{
            fineractClient.searchAccount = jest.fn().mockResolvedValue({
                statusCode: 200,
                data:[{}]
            });
            fineractClient.getSavingsAccount = jest.fn().mockResolvedValue({
                statusCode: 200,
                data: {
                    status:{
                        active: false
                    }
                }
            });
            try{
                await ccAggregate.quoteRequest(validQuoteRequestBody);
            }catch(err: unknown){
                if(err instanceof ValidationError){
                    expect(err.mlCode).toEqual('5107');
                    expect(err.httpCode).toEqual(500);
                }
            }
        });

        test('should return http code 500 and 5000 mojaloop code if get client fails',async ()=>{
            fineractClient.searchAccount = jest.fn().mockResolvedValue({
                statusCode: 200,
                data:[{}]
            });
            fineractClient.getSavingsAccount = jest.fn().mockResolvedValue({
                statusCode: 200,
                data: {
                    currency:{
                        code:'UGX'
                    },
                    status:{
                        active: true
                    },
                    subStatus:{
                        blockCredit: false,
                        blockDebit: false
                    }
                }
            });
            fineractClient.getClient = jest.fn().mockResolvedValue({
                statusCode: 500
            });
            try{
                await ccAggregate.quoteRequest(validQuoteRequestBody);
            }catch(err: unknown){
                if(err instanceof ValidationError){
                    expect(err.mlCode).toEqual('5000');
                    expect(err.httpCode).toEqual(500);
                }
            }
        });
    });

    describe('Payee Receive Transfer tests', () => {
        beforeEach(() => {
            fineractClient.getAccountId = jest.fn().mockResolvedValue({
                statusCode: 200,
                data: fixtures.fineractGetAccountIdResponseDto(),
            });
            fineractClient.receiveTransfer = jest.fn().mockResolvedValue({
                statusCode: 200,
                data: fixtures.fineractReceiveTransferResponseDto(),
            });
        });

        test('should return a 400 Bad Request for an invalid IBAN string', async ()=>{
            try{
                await ccAggregate.receiveTransfer(invalidIBANTransfer);
            }catch(err: unknown){
                if( err instanceof ValidationError){
                    expect(err.httpCode).toEqual(400);
                }
            }
        });

        test('should return http code 500 and ml code 5101 for an invalid quote', async ()=>{
            try{
                await ccAggregate.receiveTransfer(invalidQuoteTransfer);
            }catch(err: unknown){
                if( err instanceof ValidationError){
                    expect(err.mlCode).toEqual('5101');
                    expect(err.httpCode).toEqual(500);
                }
            }
        });

        test('test receive transfer should resolve', async () => {
            const res = await ccAggregate.receiveTransfer(validTransfer);
            expect(res.transferState).toEqual('RECEIVED');
        });
    });

    describe('Payee commit on patch notification transfer tests', ()=>{
        beforeEach(() => {});

        test('should return 200 OK if transaction status is not COMPLETED', async ()=>{
            try{
                await ccAggregate.receivePatchNotification(getPatchNotificationBody("ERROR_OCCURRED"));
            }catch(err: unknown){
                if(err instanceof ValidationError){
                    expect(err.httpCode).toEqual(200);
                    expect(err.mlCode).toEqual("5000");
                }
            }
        });

        test('should return http code 500 and ml code 5000 if fineract search for account number fails ', async ()=>{
            fineractClient.searchAccount = jest.fn().mockImplementation(()=>{
                throw FineractError.genericAccountSearchFailedError('Search for account failed');
            });

            try{
                await ccAggregate.receivePatchNotification(getPatchNotificationBody("COMPLETED"));
            }catch(err: unknown){
                if( err instanceof FineractError){
                    expect(err.httpCode).toEqual(500);
                    expect(err.mlCode).toEqual("5000");
                }
            }
        });

        test('should return httpCode 400 and mlCode 3100 for unsupported Id Type', async ()=>{
            try{
                await ccAggregate.receivePatchNotification(getPatchNotificationBody("COMPLETED","MSISDN"));
            }catch(err: unknown){
                if( err instanceof ValidationError){
                    expect(err.httpCode).toEqual(400);
                    expect(err.mlCode).toEqual("3100");
                }
            }
        });

        test('should return httpCode 500 and mlCode 5000 for a failed deposit in fineract', async ()=>{
            fineractClient.receiveTransfer = jest.fn().mockImplementation(()=>{
                throw FineractError.depositFailedError('5000',500);
            });
            try{
                await ccAggregate.receivePatchNotification(getPatchNotificationBody("COMPLETED"));
            }catch(err: unknown){
                if( err instanceof FineractError){
                    expect(err.httpCode).toEqual(500);
                    expect(err.mlCode).toEqual("5000");
                }
            }
        });
    });

    describe('sendTransfer method tests', () => {
        beforeEach(() => {
            fineractClient.getSavingsAccount = jest.fn().mockResolvedValueOnce({
                statusCode: 200,
                data: fineractGetSavingsAccountResponseDto(false, false, 10000, true),
            });
            sdkClient.initiateTransfer = jest.fn().mockResolvedValue({
                statusCode: 200,
                data: sdkInitiateTransferResponseDto('100', '100'),
            });
            fineractClient.calculateWithdrawQuote = jest.fn().mockResolvedValue({
                feeAmount: fineractCalculateWithdrawQuoteResponseDto(200),
            });
        });

        test('test sendTransfer happy path', async () => {
            sdkClient.initiateTransfer = jest.fn().mockResolvedValue({
                statusCode: 200,
                data: postTransfersSuccessfulResponseDto("WAITING_FOR_PARTY_ACCEPTANCE"),
            });
            const transferRequest: TFineractOutboundTransferRequest = getSendTransferRequestBody(2, '100');
            const res = await ccAggregate.sendTransfer(transferRequest);
            expect(res.totalAmountFromFineract).toEqual(200);
        });

        test('test sendTransfer with blockedCredit or Debit. Should throw accountDebitOrCreditBlockedError', async () => {
            fineractClient.getSavingsAccount = jest.fn().mockResolvedValueOnce({
                statusCode: 200,
                data: fineractGetSavingsAccountResponseDto(true, false, 10000, true),
            });
            const transferRequest: TFineractOutboundTransferRequest = getSendTransferRequestBody(2,'100');
            try {
                await ccAggregate.sendTransfer(transferRequest);
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(FineractError);
                expect((error as FineractError).mlCode).toEqual('5107');
            }
        });

        test('should return httpCode 500 when getAccount fails or account is inactive', async ()=>{
            fineractClient.getSavingsAccount = jest.fn().mockResolvedValueOnce({
                statusCode: 500,
                data: fineractGetSavingsAccountResponseDto(false, false, 10000, false),
            });
            sdkClient.initiateTransfer = jest.fn().mockResolvedValue({
                statusCode: 200,
                data: postTransfersSuccessfulResponseDto("WAITING_FOR_PARTY_ACCEPTANCE"),
            });
            const transferRequest: TFineractOutboundTransferRequest = getSendTransferRequestBody(2, '100');
            try{
                await ccAggregate.sendTransfer(transferRequest);
            }catch(err: unknown){
                if( err instanceof ValidationError){
                    expect(err.httpCode).toEqual(500);
                    expect(err.mlCode).toEqual("3200");
                }
            }
        });

        test('should return httpCode 500 if quote response fails', async ()=>{
            sdkClient.updateTransfer = jest.fn().mockResolvedValueOnce({
                statusCode: 500,
            });
            sdkClient.initiateTransfer = jest.fn().mockResolvedValue({
                statusCode: 200,
                data: postTransfersSuccessfulResponseDto("WAITING_FOR_CONVERSION_ACCEPTANCE"),
            });
            const transferRequest: TFineractOutboundTransferRequest = getSendTransferRequestBody(2, '100');
            try{
                await ccAggregate.sendTransfer(transferRequest);
            }catch(err: unknown){
                if( err instanceof SDKClientError){
                    expect(err.httpCode).toEqual(500);
                    expect(err.mlCode).toEqual("4000");
                }
            }
        });
    });
});
