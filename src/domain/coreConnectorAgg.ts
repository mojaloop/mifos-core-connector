/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list (alphabetical ordering) of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.


 - Okello Ivan Elijah <elijahokello90@gmail.com>

 --------------
 ******/

'use strict';

import { randomUUID } from 'crypto';
import {
    IFineractClient,
    IdType,
    PartyType,
    TFineractConfig,
    TFineractTransactionPayload,
    TFineractTransferDeps,
    TFineractGetAccountResponse,
    EStage,
} from './FineractClient';
import {
    ILogger,
    TLookupPartyInfoResponse,
    TQuoteResponse,
    TQuoteRequest,
    TtransferResponse,
    TtransferRequest,
    ValidationError,
    TtransferPatchNotificationRequest,
} from './interfaces';
import {
    ISDKClient,
    SDKClientError,
    TFineractOutboundTransferRequest,
    TFineractOutboundTransferResponse,
    TSDKOutboundTransferRequest,
    TSDKOutboundTransferResponse,
    TtransferContinuationResponse,
    TUpdateTransferDeps,
} from './SDKClient';
import { FineractError } from './FineractClient';

export class CoreConnectorAggregate {
    public IdType: string;
    private logger: ILogger;
    DATE_FORMAT = 'dd MM yy';

    constructor(
        private readonly fineractConfig: TFineractConfig,
        private readonly fineractClient: IFineractClient,
        private readonly sdkClient: ISDKClient,
        logger: ILogger,
    ) {
        this.IdType = fineractConfig.FINERACT_ID_TYPE;
        this.logger = logger;
    }

    async getParties(IBAN: string, RequestIdType: string): Promise<TLookupPartyInfoResponse> {
        this.logger.info(`Get Parties for IBAN ${IBAN}`);
        if (RequestIdType !== this.IdType) {
            throw ValidationError.unsupportedIdTypeError();
        }
        const accountNo = this.validateIbanAndGetAccountNo(IBAN);
        const lookupRes = await this.fineractClient.lookupPartyInfo(accountNo);
        const party: TLookupPartyInfoResponse = {
            data: {
                displayName: lookupRes.data.displayName,
                firstName: lookupRes.data.firstname,
                idType: IdType.IBAN,
                idValue: accountNo,
                lastName: lookupRes.data.lastname,
                middleName: lookupRes.data.firstname,
                type: PartyType.CONSUMER,
                supportedCurrencies: JSON.stringify(this.fineractConfig.FINERACT_SUPPORTED_CURRENCIES),
                kycInformation: `${JSON.stringify(lookupRes.data)}`,
            },
            statusCode: lookupRes.status,
        };
        this.logger.info(`Party found`, { party });
        return party;
    }

    async quoteRequest(quoteRequest: TQuoteRequest): Promise<TQuoteResponse> {
        this.logger.info(`Get Parties for ${this.IdType} ${quoteRequest.to.idValue}`);
        if (quoteRequest.to.idType !== this.IdType) {
            throw ValidationError.unsupportedIdTypeError();
        }
        const accountNo = this.validateIbanAndGetAccountNo(quoteRequest.to.idValue);
        const accountRes = await this.fineractClient.verifyBeneficiary(accountNo);
        if (quoteRequest.currency !== accountRes.currency) {
            throw ValidationError.unsupportedCurrency();
        }
        return {
            expiration: new Date().toJSON(),
            payeeFspCommissionAmount: '0',
            payeeFspCommissionAmountCurrency: quoteRequest.currency,
            payeeFspFeeAmount: '0',
            payeeFspFeeAmountCurrency: quoteRequest.currency,
            payeeReceiveAmount: quoteRequest.amount,
            payeeReceiveAmountCurrency: quoteRequest.currency,
            quoteId: quoteRequest.quoteId,
            transactionId: quoteRequest.transactionId,
            transferAmount: quoteRequest.amount,
            transferAmountCurrency: quoteRequest.currency,
        };
    }

    async receiveTransfer(transfer: TtransferRequest): Promise<TtransferResponse> {
        this.logger.info(`Transfer for  ${this.IdType} ${transfer.to.idValue}`);
        if (transfer.to.idType != this.IdType) {
            throw ValidationError.unsupportedIdTypeError();
        }
        this.validateIbanAndGetAccountNo(transfer.to.idValue);
        if (!this.validateQuote(transfer)) {
            throw ValidationError.quoteValidationError();
        }
        return {
            completedTimestamp: new Date().toJSON(),
            homeTransactionId: randomUUID(),
            transferState: 'RECEIVED',
        };
    }

    private async initiateCompensationAction() {
        // todo function implementation to be defined.
    }

    async receivePatchNotification(patchTransferBody: TtransferPatchNotificationRequest): Promise<boolean> {
        this.logger.info('Received patch notification. Executing transfer...');
        if (patchTransferBody.currentState !== 'COMPLETED') {
            await this.initiateCompensationAction();
            throw ValidationError.transferNotComplete('5000', 200);
        }
        if (!patchTransferBody.quoteRequest?.body.payee.partyIdInfo.partyIdentifier) {
            await this.initiateCompensationAction();
            throw ValidationError.partyIdNotProvided();
        }
        if(patchTransferBody.quoteRequest?.body.payee.partyIdInfo.partyIdType !== this.IdType) {
            await this.initiateCompensationAction();
            throw ValidationError.unsupportedIdTypeError();
        }
        const accountNo = this.validateIbanAndGetAccountNo(
            patchTransferBody.quoteRequest.body.payee.partyIdInfo.partyIdentifier,
        );
        const res = await this.fineractClient.getAccountId(accountNo, EStage.TRANSFER);
        const date = new Date();
        const transaction: TFineractTransactionPayload = {
            locale: this.fineractConfig.FINERACT_LOCALE,
            dateFormat: this.DATE_FORMAT,
            transactionDate: `${date.getDate()} ${date.getMonth() + 1} ${date.getFullYear()}`,
            transactionAmount: patchTransferBody.quoteRequest.body.amount.amount,
            paymentTypeId: this.fineractConfig.FINERACT_PAYMENT_TYPE_ID,
            accountNumber: accountNo,
            routingCode: randomUUID(),
            receiptNumber: randomUUID(),
            bankNumber: this.fineractConfig.FINERACT_BANK_ID,
        };

        const depositRes = await this.fineractClient.receiveTransfer({
            accountId: res.accountId as number,
            transaction: transaction,
        });

        if (depositRes.statusCode !== 200) {
            await this.initiateCompensationAction();
            throw FineractError.depositFailedError('5000', 500);
        }
        return true;
    }

    private validateConversionTerms(transferRes: TSDKOutboundTransferResponse): boolean {
        let result = true;
        if (
            !this.fineractConfig.FINERACT_SUPPORTED_CURRENCIES.some(
                (value: string) => value === transferRes.fxQuotesResponse?.body.conversionTerms.sourceAmount.currency,
            )
        ) {
            result = false;
        }
        if (transferRes.amountType === 'SEND') {
            if (!(transferRes.amount === transferRes.fxQuotesResponse?.body.conversionTerms.sourceAmount.amount)) {
                result = false;
            }
            if(!transferRes.to.supportedCurrencies){
                throw SDKClientError.genericQuoteValidationError("Payee Supported Currency not defined",{httpCode: 500, mlCode:"4000"});
            }
            if(!transferRes.to.supportedCurrencies.some(value => value === transferRes.quoteResponse?.body.transferAmount.currency)){
                result = false;
            }
            if(!(transferRes.currency === transferRes.fxQuotesResponse?.body.conversionTerms.sourceAmount.currency)){
                result = false;
            }
        } else if (transferRes.amountType === 'RECEIVE') {
            if (!(transferRes.amount === transferRes.fxQuotesResponse?.body.conversionTerms.targetAmount.amount)) {
                result = false;
            }
            if(!(transferRes.currency === transferRes.quoteResponse?.body.transferAmount.currency)){
                result = false;
            }
            if(transferRes.fxQuotesResponse){
                if(!transferRes.from.supportedCurrencies){
                    throw ValidationError.unsupportedCurrency();
                }
                if(!(transferRes.from.supportedCurrencies.some(value => value === transferRes.fxQuotesResponse?.body.conversionTerms.targetAmount.currency))){
                    result = false;
                }
            }
        }
        return result;
    }

    private async respondToConversionTerms(
        acceptable: boolean,
        transferRes: TSDKOutboundTransferResponse,
    ): Promise<TtransferContinuationResponse> {
        if (!transferRes.transferId) {
            throw SDKClientError.noTransferIdReturned();
        }
        const acceptConversionRes = await this.sdkClient.updateTransfer(
            {
                acceptConversion: acceptable,
            },
            transferRes.transferId,
        );
        if (acceptConversionRes.statusCode != 200) {
            throw SDKClientError.continueTransferError('Failed to accept Conversion Terms', {
                httpCode: 500,
                mlCode: '4000',
            });
        }
        return acceptConversionRes.data;
    }

    private async validateReceivedQuote(outboundTransferRes: TSDKOutboundTransferResponse): Promise<boolean> {
        let result = true;
        if (!this.validateConversionTerms(outboundTransferRes)) {
            result = false;
        }
        const quoteResponseBody = outboundTransferRes.quoteResponse?.body;
        const fxQuoteResponseBody = outboundTransferRes.fxQuotesResponse?.body
        if(!quoteResponseBody){
            throw SDKClientError.noQuoteReturnedError();
        }
        if(outboundTransferRes.amountType === "SEND"){
            if(!(parseFloat(outboundTransferRes.amount) === parseFloat(quoteResponseBody.transferAmount.amount) - parseFloat(quoteResponseBody.payeeFspCommission?.amount || "0") )){
                result = false;
            }
            if(!quoteResponseBody.payeeReceiveAmount){
                throw SDKClientError.genericQuoteValidationError("Payee Receive Amount not defined", {httpCode: 500, mlCode: "4000"});
            }
            if(!(parseFloat(quoteResponseBody.payeeReceiveAmount.amount) === parseFloat(quoteResponseBody.transferAmount.amount)-parseFloat(quoteResponseBody.payeeFspCommission?.amount || '0'))){
                result = false;
            }
            if(!(fxQuoteResponseBody?.conversionTerms.targetAmount.amount === quoteResponseBody.transferAmount.amount)){
               result = false;
            }
        }else if (outboundTransferRes.amountType === "RECEIVE"){
            if(!outboundTransferRes.quoteResponse){
                throw SDKClientError.noQuoteReturnedError();
            }
            if(!(parseFloat(outboundTransferRes.amount) === parseFloat(quoteResponseBody.transferAmount.amount) - parseFloat(quoteResponseBody.payeeFspCommission?.amount || "0") + parseFloat(quoteResponseBody.payeeFspFee?.amount || "0"))){
                result = false;
            }

            if(!(quoteResponseBody.payeeReceiveAmount?.amount === quoteResponseBody.transferAmount.amount)){
                result = false;
            }
            if(fxQuoteResponseBody){
                if(!(fxQuoteResponseBody.conversionTerms.targetAmount.amount === quoteResponseBody.transferAmount.amount )){
                    result = false;
                }
            }
        }else{
            SDKClientError.genericQuoteValidationError("Invalid amountType received", {httpCode: 500, mlCode: "4000"});
        }
        return result;
    }

    async sendTransfer(transfer: TFineractOutboundTransferRequest): Promise<TFineractOutboundTransferResponse> {
        this.logger.info(`Transfer from fineract account with ID${transfer.from.fineractAccountId}`);
        const accountData = await this.getSavingsAccount(transfer.from.fineractAccountId);
        if (accountData.subStatus.blockCredit || accountData.subStatus.blockDebit) {
            const errMessage = 'Account blocked from credit or debit';
            this.logger.warn(errMessage, accountData);
            throw FineractError.accountDebitOrCreditBlockedError(errMessage);
        }
        const sdkOutboundTransfer: TSDKOutboundTransferRequest = this.getSDKTransferRequest(transfer);
        const transferRes = await this.sdkClient.initiateTransfer(sdkOutboundTransfer);
        if ((await this.validateReceivedQuote(transferRes.data))) {
            if(transferRes.data.currentState === "WAITING_FOR_CONVERSION_ACCEPTANCE"){
                await this.respondToConversionTerms(true,transferRes.data);
            }
        }else{
            if(transferRes.data.currentState === "WAITING_FOR_CONVERSION_ACCEPTANCE"){
                await this.respondToConversionTerms(false,transferRes.data);
            }
            throw SDKClientError.invalidQuoteReceived('Quote Validation Failed', {
                httpCode: 500,
                mlCode: '4000',
            });
        }
        if (
            !transferRes.data.quoteResponse ||
            !transferRes.data.quoteResponse.body.payeeFspCommission ||
            !transferRes.data.quoteResponse.body.payeeFspFee
        ) {
            throw SDKClientError.noQuoteReturnedError();
        }
        const totalFineractFee = await this.fineractClient.calculateWithdrawQuote({
            amount: this.getAmountSum([
                parseFloat(transferRes.data.amount),
                parseFloat(transferRes.data.quoteResponse.body.payeeFspFee.amount),
                parseFloat(transferRes.data.quoteResponse.body.payeeFspCommission.amount),
            ]),
        });
        if (!this.checkAccountBalance(totalFineractFee.feeAmount, accountData.summary.availableBalance)) {
            this.logger.warn('Payer account does not have sufficient funds for transfer', accountData);
            throw FineractError.accountInsufficientBalanceError();
        }

        return {
            totalAmountFromFineract: totalFineractFee.feeAmount,
            transferResponse: transferRes.data,
        };
    }

    async updateSentTransfer(transferAccept: TUpdateTransferDeps): Promise<TtransferContinuationResponse> {
        this.logger.info(
            `Continuing transfer with id ${transferAccept.sdkTransferId} and account with id ${transferAccept.fineractTransaction.fineractAccountId}`,
        );
        let transaction: TFineractTransferDeps | null = null;
        if (!transferAccept.transferContinuationAccept.acceptQuote) {
            throw SDKClientError.quoteRejectedError();
        }

        try {
            transaction = await this.getTransaction(transferAccept);
            const withdrawRes = await this.fineractClient.sendTransfer(transaction);
            if (withdrawRes.statusCode != 200) {
                throw FineractError.withdrawFailedError(`Withdraw failed with status code ${withdrawRes.statusCode}`);
            }

            const updateTransferRes = await this.sdkClient.updateTransfer(
                { acceptQuote: true },
                transferAccept.sdkTransferId,
            );

            if(!await this.validateReceivedQuote(updateTransferRes.data)){
                throw SDKClientError.invalidQuoteReceived("Quote Validation Failed", {httpCode:500,mlCode:'5000'});
            }

            return updateTransferRes.data;
        } catch (error: unknown) {
            if (transaction) return await this.processUpdateSentTransferError(error, transaction);
            throw error;
        }
    }

    validateIbanAndGetAccountNo(IBAN: string): string {
        // todo: think how to validate account numbers
        const accountNo = IBAN.slice(
            this.fineractConfig.FINERACT_BANK_COUNTRY_CODE.length +
                this.fineractConfig.FINERACT_CHECK_DIGITS.length +
                this.fineractConfig.FINERACT_BANK_ID.length +
                this.fineractConfig.FINERACT_ACCOUNT_PREFIX.length,
        );
        this.logger.debug('extracted account number from IBAN:', { accountNo, IBAN });
        if (accountNo.length < 1) {
            throw ValidationError.invalidAccountNumberError();
        }
        return accountNo;
    }

    private getSDKTransferRequest(transfer: TFineractOutboundTransferRequest): TSDKOutboundTransferRequest {
        return {
            homeTransactionId: transfer.homeTransactionId,
            from: transfer.from.payer,
            to: transfer.to,
            amountType: transfer.amountType,
            currency: transfer.currency,
            amount: transfer.amount,
            transactionType: transfer.transactionType,
            subScenario: transfer.subScenario,
            note: transfer.note,
            quoteRequestExtensions: transfer.quoteRequestExtensions,
            transferRequestExtensions: transfer.transferRequestExtensions,
            skipPartyLookup: transfer.skipPartyLookup,
        };
    }

    private getAmountSum(amounts: number[]): number {
        let sum = 0;
        for (const amount of amounts) {
            sum = amount + sum;
        }
        return sum;
    }

    private checkAccountBalance(totalAmount: number, accountBalance: number): boolean {
        return accountBalance > totalAmount;
    }

    private async getSavingsAccount(accountId: number): Promise<TFineractGetAccountResponse> {
        this.logger.debug('getting active savingsAccount...', { accountId });
        const account = await this.fineractClient.getSavingsAccount(accountId);

        if (!account.data.status.active) {
            throw ValidationError.accountVerificationError();
        }

        return account.data;
    }

    private async getTransaction(transferAccept: TUpdateTransferDeps): Promise<TFineractTransferDeps> {
        this.logger.info('Getting fineract transaction');
        const accountRes = await this.fineractClient.getSavingsAccount(
            transferAccept.fineractTransaction.fineractAccountId,
        );

        const date = new Date();
        return {
            accountId: transferAccept.fineractTransaction.fineractAccountId,
            transaction: {
                locale: this.fineractConfig.FINERACT_LOCALE,
                dateFormat: this.DATE_FORMAT,
                transactionDate: `${date.getDate()} ${date.getMonth() + 1} ${date.getFullYear()}`,
                transactionAmount: transferAccept.fineractTransaction.totalAmount.toString(),
                paymentTypeId: this.fineractConfig.FINERACT_PAYMENT_TYPE_ID,
                accountNumber: accountRes.data.accountNo,
                routingCode: transferAccept.fineractTransaction.routingCode,
                receiptNumber: transferAccept.fineractTransaction.receiptNumber,
                bankNumber: transferAccept.fineractTransaction.bankNumber,
            },
        };
    }

    private validateQuote(transfer: TtransferRequest): boolean {
        let result = true;
        if (transfer.amountType === 'SEND') {
            if (!this.checkSendAmounts(transfer)) {
                result = false;
            }
        } else if (transfer.amountType === 'RECEIVE') {
            if (!this.checkReceiveAmounts(transfer)) {
                result = false;
            }
        }
        return result;
    }

    private checkSendAmounts(transfer: TtransferRequest): boolean {
        this.logger.info('Validating Type Send Quote...', { transfer });
        let result = true;
        if (
            parseFloat(transfer.amount) !==
            parseFloat(transfer.quote.transferAmount) - parseFloat(transfer.quote.payeeFspCommissionAmount || '0')
            // POST /transfers request.amount == request.quote.transferAmount - request.quote.payeeFspCommissionAmount
        ) {
            result = false;
        }

        if (
            parseFloat(transfer.quote.payeeReceiveAmount) !==
            parseFloat(transfer.quote.transferAmount) -
            parseFloat(transfer.quote.payeeFspFeeAmount)
        ) {
            result = false;
        }
        return result;
    }

    private checkReceiveAmounts(transfer: TtransferRequest): boolean {
        this.logger.info('Validating Type Receive Quote...', { transfer });
        let result = true;
        if (
            parseFloat(transfer.amount) !==
            parseFloat(transfer.quote.transferAmount) -
                parseFloat(transfer.quote.payeeFspCommissionAmount || '0') +
                parseFloat(transfer.quote.payeeFspFeeAmount)
        ) {
            result = false;
        }

        if (parseFloat(transfer.quote.payeeReceiveAmount) !== parseFloat(transfer.quote.transferAmount)) {
            result = false;
        }
        return result;
    }

    // think of better way to handle refunding
    private async processUpdateSentTransferError(error: unknown, transaction: TFineractTransferDeps): Promise<never> {
        let needRefund = error instanceof SDKClientError;
        try {
            const errMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`error in updateSentTransfer: ${errMessage}`, { error, needRefund, transaction });
            if (!needRefund) throw error;
            //Refund the money
            const depositRes = await this.fineractClient.receiveTransfer(transaction);
            if (depositRes.statusCode != 200) {
                const logMessage = `Invalid statusCode from fineractClient.receiveTransfer: ${depositRes.statusCode}`;
                this.logger.warn(logMessage);
                throw new Error(logMessage);
            }
            needRefund = false;
            this.logger.info('Refund successful', { needRefund });
            throw error;
        } catch (err: unknown) {
            if (!needRefund) throw error;

            const details = {
                amount: parseFloat(transaction.transaction.transactionAmount),
                fineractAccountId: transaction.accountId,
            };
            this.logger.error('refundFailedError', { details, transaction });
            throw ValidationError.refundFailedError(details);
        }
    }
}
