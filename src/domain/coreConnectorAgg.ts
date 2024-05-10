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
} from './FineractClient/types';
import {
    ILogger,
    TLookupPartyInfoResponse,
    TQuoteResponse,
    TQuoteRequest,
    TtransferResponse,
    TtransferRequest,
    InvalidAccountNumberError,
    AccountVerificationError,
    UnSupportedIdTypeError,
    RefundFailedError,
} from './interfaces';
import {
    ISDKClient,
    SDKClientContinueTransferError,
    SDKClientInitiateTransferError,
    SDKNoQuoteReturnedError,
    TFineractOutboundTransferRequest,
    TFineractOutboundTransferResponse,
    TSDKOutboundTransferRequest,
    TtransferContinuationResponse,
    TUpdateTransferDeps,
} from './SDKClient';
import {
    FineractGetAccountWithIdError,
    FineractAccountInsufficientBalance,
    FineractWithdrawFailedError,
    SearchFineractAccountError,
} from './FineractClient';

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

    async getParties(IBAN: string): Promise<TLookupPartyInfoResponse> {
        this.logger.info(`Get Parties for IBAN ${IBAN}`);
        const accountNo = this.extractAccountFromIBAN(IBAN);
        if (accountNo.length < 1) {
            throw new InvalidAccountNumberError(`Account number length is too short`, 'MFCC Agg');
        }
        const lookupRes = await this.fineractClient.lookupPartyInfo(accountNo);
        const party = {
            data: {
                displayName: lookupRes.data.displayName,
                firstName: lookupRes.data.firstname,
                idType: IdType.IBAN,
                idValue: accountNo,
                lastName: lookupRes.data.lastname,
                middleName: lookupRes.data.firstname,
                type: PartyType.CONSUMER,
                kycInformation: `${JSON.stringify(lookupRes.data)}`,
            },
            statusCode: lookupRes.status,
        };
        this.logger.info(`Party found`, { party });
        return party;
    }

    async quoteRequest(quoteRequest: TQuoteRequest): Promise<TQuoteResponse> {
        if (quoteRequest.to.idType != this.IdType) {
            throw new UnSupportedIdTypeError('Unsupported ID Type', 'MFCC Agg');
        }
        this.logger.info(`Get Parties for ${this.IdType} ${quoteRequest.to.idValue}`);
        const accountNo = this.extractAccountFromIBAN(quoteRequest.to.idValue);
        if (accountNo.length < 1) {
            throw new InvalidAccountNumberError(`Account number length is too short`, 'MFCC Agg');
        }
        const quoteRes = await this.fineractClient.verifyBeneficiary(accountNo);
        if (quoteRes.status != 200) {
            throw new AccountVerificationError('Account verification Failed', 'MFCC Agg');
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
        if (transfer.to.idType != this.IdType) {
            throw new UnSupportedIdTypeError('Unsupported ID Type', 'MFCC Agg');
        }
        this.logger.info(`Transfer for  ${this.IdType} ${transfer.to.idValue}`);
        const accountNo = this.extractAccountFromIBAN(transfer.to.idValue);
        if (accountNo.length < 1) {
            throw new InvalidAccountNumberError(`Account number length is too short`, 'MFCC Agg');
        }
        const res = await this.fineractClient.getAccountId(accountNo);
        const date = new Date();
        const transaction: TFineractTransactionPayload = {
            locale: this.fineractConfig.FINERACT_LOCALE,
            dateFormat: this.DATE_FORMAT,
            transactionDate: `${date.getDate()} ${date.getMonth() + 1} ${date.getFullYear()}`,
            transactionAmount: transfer.amount,
            paymentTypeId: '1', // todo generate this id automatically
            accountNumber: accountNo,
            routingCode: randomUUID(),
            receiptNumber: randomUUID(),
            bankNumber: this.fineractConfig.FINERACT_BANK_ID,
        };
        await this.fineractClient.receiveTransfer({
            accountId: res.accountId as number,
            transaction: transaction,
        });
        const transferResponse: TtransferResponse = {
            completedTimestamp: new Date().toJSON(),
            homeTransactionId: transfer.transferId,
            transferState: 'COMMITTED',
        };
        return transferResponse;
    }

    async sendTransfer(transfer: TFineractOutboundTransferRequest): Promise<TFineractOutboundTransferResponse> {
        this.logger.info(`Transfer from fineract account with ID${transfer.from.fineractAccountId}`);
        const account = await this.fineractClient.getSavingsAccount(transfer.from.fineractAccountId);
        if (account.statusCode != 200) {
            throw new FineractGetAccountWithIdError('Failed to retrieve source account from fineract', 'MFCC Agg');
        } else if (!account.data.status.active) {
            throw new AccountVerificationError('Funds Source Account is not active in Fineract', 'MFCC Agg');
        }
        const sdkOutboundTransfer: TSDKOutboundTransferRequest = this.getSDKTransferRequest(transfer);
        const transferRes = await this.sdkClient.initiateTransfer(sdkOutboundTransfer);
        if (transferRes.statusCode != 200) {
            throw new SDKClientInitiateTransferError(
                `Transfer initiation failed with status code ${transferRes.statusCode}`,
                'MFCC Agg',
            );
        } else if (!transferRes.data.quoteResponse) {
            throw new SDKNoQuoteReturnedError('Quote response is not defined', 'MFCC Agg');
        }
        const totalFineractFee = await this.fineractClient.calculateWithdrawQuote({
            amount: this.getAmountSum([
                parseFloat(transferRes.data.amount),
                parseFloat(transferRes.data.quoteResponse.body.payeeFspFee?.amount as string),
                parseFloat(transferRes.data.quoteResponse.body.payeeFspCommission?.amount as string),
            ]),
        });
        if (!this.checkAccountBalance(totalFineractFee.feeAmount, account.data.summary.availableBalance)) {
            throw new FineractAccountInsufficientBalance(
                'Payer account does not have sufficient funds for transfer',
                'MFCC Agg',
            );
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
        const accountRes = await this.fineractClient.getSavingsAccount(
            transferAccept.fineractTransaction.fineractAccountId as number,
        );

        if (accountRes.statusCode != 200) {
            throw new SearchFineractAccountError(
                `Search for Account failed with status code ${accountRes.statusCode}`,
                'MFCC Agg',
            );
        }

        const date = new Date();
        const transaction: TFineractTransferDeps = {
            accountId: transferAccept.fineractTransaction.fineractAccountId as number,
            transaction: {
                locale: this.fineractConfig.FINERACT_LOCALE,
                dateFormat: this.DATE_FORMAT,
                transactionDate: `${date.getDate()} ${date.getMonth() + 1} ${date.getFullYear()}`,
                transactionAmount: transferAccept.fineractTransaction.totalAmount.toString(),
                paymentTypeId: '1',
                accountNumber: accountRes.data.accountNo,
                routingCode: transferAccept.fineractTransaction.routingCode,
                receiptNumber: transferAccept.fineractTransaction.receiptNumber,
                bankNumber: transferAccept.fineractTransaction.bankNumber,
            },
        };
        const withdrawRes = await this.fineractClient.sendTransfer(transaction);
        if (withdrawRes.statusCode != 200) {
            throw new FineractWithdrawFailedError(
                `Withdraw failed with status code ${withdrawRes.statusCode}`,
                'MFCC Agg',
            );
        }

        try {
            const updateTransferRes = await this.sdkClient.updateTransfer(
                { acceptQuote: true },
                transferAccept.sdkTransferId as number,
            );
            if (updateTransferRes.statusCode != 200) {
                this.logger.error('Initiate update Transfer failed.', updateTransferRes);
                throw new SDKClientContinueTransferError(
                    'SDKClient initiate update receiveTransfer failed.',
                    'MFCC Agg',
                );
            }
            return updateTransferRes.data;
        } catch (error) {
            if (error instanceof SDKClientContinueTransferError) {
                //Refund the money
                const depositRes = await this.fineractClient.receiveTransfer(transaction);
                if (depositRes.statusCode != 200) {
                    throw new RefundFailedError({
                        message: `Refund of ${transferAccept.fineractTransaction.totalAmount} failed for account with id ${transferAccept.fineractTransaction.fineractAccountId}`,
                        context: 'MFCC Agg',
                        refundDetails: {
                            amount: parseFloat(transaction.transaction.transactionAmount),
                            fineractAccountId: transaction.accountId,
                        },
                    });
                }
            }
            throw new SDKClientContinueTransferError('SDKClient initiate update receiveTransfer failed.', 'MFCC Agg');
        }
    }

    extractAccountFromIBAN(IBAN: string): string {
        // todo think how to validate account numbers
        return IBAN.slice(
            this.fineractConfig.FINERACT_BANK_COUNTRY_CODE.length +
                this.fineractConfig.FINERACT_CHECK_DIGITS.length +
                this.fineractConfig.FINERACT_BANK_ID.length +
                this.fineractConfig.FINERACT_ACCOUNT_PREFIX.length,
        );
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
}
