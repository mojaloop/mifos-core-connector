import {
    TFineractOutboundTransferRequest,
    TSDKOutboundTransferResponse,
    TUpdateTransferDeps
} from '../src/domain/SDKClient';
import { TFineractGetAccountResponse, TFineractTransactionResponse } from '../src/domain/FineractClient';
import * as crypto from 'node:crypto';
import {TtransferPatchNotificationRequest, TtransferRequest} from "../src/domain";
import {randomUUID} from "crypto";
import {components as fspiopComponents} from "@mojaloop/api-snippets/lib/fspiop/v2_0/openapi";
import {components} from "@mojaloop/api-snippets/lib/sdk-scheme-adapter/v2_1_0/outbound/openapi";

const IBAN = 'UG680720000289000000006';

type TransferAcceptInputDto = {
    fineractAccountId?: number;
    totalAmount?: number;
    sdkTransferId?: string;
};

export const transferAcceptDto = ({
    fineractAccountId = 1,
    totalAmount = 123.45,
    sdkTransferId = "999",
}: TransferAcceptInputDto = {}): TUpdateTransferDeps =>
    ({
        transferContinuationAccept:{
            acceptQuote: true
        },
        fineractTransaction: {
            fineractAccountId,
            totalAmount,
            routingCode: 'routingCode',
            receiptNumber: 'receiptNumber',
            bankNumber: 'bankNumber',
        },
        sdkTransferId,
    }) as const;

// todo: make it configurable, add all required fields
export const fineractGetAccountResponseDto = (): Partial<TFineractGetAccountResponse> =>
    ({
        id: 'id',
        accountNo: 'accountNo',
        clientId: 123,
        clientName: 'clientName',
    }) as const;

// todo: make it configurable,
export const fineractTransactionResponseDto = (): TFineractTransactionResponse =>
    ({
        officeId: 1,
        clientId: 2,
        savingsId: 3,
        resourceId: 4,
        changes: {
            accountNumber: 'accountNumber',
            routingCode: 'routingCode',
            receiptNumber: 'receiptNumber',
            bankNumber: 'bankNumber',
        },
    }) as const;

export const fineractLookUpPartyResponseDto = () =>
    ({
        displayName: 'Dove Love',
        firstname: 'Dove',
        lastname: 'Love',
    }) as const;

export const fineractVerifyBeneficiaryResponseDto = () =>
    ({
        currency: 'UGX',
        amount: '100',
        quoteId: crypto.randomUUID(),
        transactionId: crypto.randomUUID(),
    }) as const;

export const fineractGetAccountIdResponseDto = () => ({
    accountId: 1,
});

export const fineractReceiveTransferResponseDto = () => true;

export const fineractGetSavingsAccountResponseDto = (
    credit: boolean,
    debit: boolean,
    balance: number,
    active: boolean,
) => ({
    status: {
        active: active,
    },
    subStatus: {
        blockCredit: credit,
        blockDebit: debit,
    },
    summary: {
        availableBalance: balance,
    },
});

export type getTransferResponseDeps = {
    // add dependencies for this ->|
}

export const postTransfersSuccessfulResponseDto = (
    currentState: components["schemas"]["transferStatus"]
): TSDKOutboundTransferResponse => ({
    "transferId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
    "homeTransactionId": "string",
    "from": {
        "type": "CONSUMER",
        "idType": "MSISDN",
        "idValue": "16135551212",
        "idSubValue": "string",
        "displayName": "NnSs.ygu9Pg8w5p_jA0h9beqhCZjvlrj0_PkiyhpobQB4oVE",
        "firstName": "Henrik",
        "middleName": "Johannes",
        "lastName": "Karlsson",
        "dateOfBirth": "1966-06-16",
        "merchantClassificationCode": "960",
        "fspId": "string",
        "supportedCurrencies": [
            "AED"
        ],
        "kycInformation": "{\n    \"metadata\": {\n        \"format\": \"JSON\",\n        \"version\": \"1.0\",\n        \"description\": \"Data containing KYC Information\"\n    },\n    \"data\": {\n        \"name\": \"John Doe\",\n        \"dob\": \"1980-05-15\",\n        \"gender\": \"Male\",\n        \"address\": \"123 Main Street, Anytown, USA\",\n        \"email\": \"johndoe@example.com\",\n        \"phone\": \"+1 555-123-4567\",\n        \"nationality\": \"US\",\n        \"passport_number\": \"AB1234567\",\n        \"issue_date\": \"2010-02-20\",\n        \"expiry_date\": \"2025-02-20\",\n        \"bank_account_number\": \"1234567890\",\n        \"bank_name\": \"Example Bank\",\n        \"employer\": \"ABC Company\",\n        \"occupation\": \"Software Engineer\",\n        \"income\": \"$80,000 per year\",\n        \"marital_status\": \"Single\",\n        \"dependents\": 0,\n        \"risk_level\": \"Low\"\n    }\n}",
        "extensionList": [
            {
                "key": "string",
                "value": "string"
            }
        ]
    },
    "to": {
        "type": "CONSUMER",
        "idType": "MSISDN",
        "idValue": "16135551212",
        "idSubValue": "string",
        "displayName": "tyLd'0NmWAQm629XIBmvl26rnEgza-rWVKwRsDgnTKRZF'QMF2whZoSsJ_s'2.gt2ZTauHvmv7XoB",
        "firstName": "Henrik",
        "middleName": "Johannes",
        "lastName": "Karlsson",
        "dateOfBirth": "1966-06-16",
        "merchantClassificationCode": "0",
        "fspId": "string",
        "supportedCurrencies": [
            "AED"
        ],
        "kycInformation": "{\n    \"metadata\": {\n        \"format\": \"JSON\",\n        \"version\": \"1.0\",\n        \"description\": \"Data containing KYC Information\"\n    },\n    \"data\": {\n        \"name\": \"John Doe\",\n        \"dob\": \"1980-05-15\",\n        \"gender\": \"Male\",\n        \"address\": \"123 Main Street, Anytown, USA\",\n        \"email\": \"johndoe@example.com\",\n        \"phone\": \"+1 555-123-4567\",\n        \"nationality\": \"US\",\n        \"passport_number\": \"AB1234567\",\n        \"issue_date\": \"2010-02-20\",\n        \"expiry_date\": \"2025-02-20\",\n        \"bank_account_number\": \"1234567890\",\n        \"bank_name\": \"Example Bank\",\n        \"employer\": \"ABC Company\",\n        \"occupation\": \"Software Engineer\",\n        \"income\": \"$80,000 per year\",\n        \"marital_status\": \"Single\",\n        \"dependents\": 0,\n        \"risk_level\": \"Low\"\n    }\n}",
        "extensionList": [
            {
                "key": "string",
                "value": "string"
            }
        ]
    },
    "amountType": "RECEIVE",
    "currency": "AED",
    "amount": "123.45",
    "transactionType": "TRANSFER",
    "subScenario": "LOCALLY_DEFINED_SUBSCENARIO",
    "note": "Note sent to Payee.",
    "currentState": currentState,
    "quoteId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
    "getPartiesResponse": {
        "body": {},
        "headers": {}
    },
    "quoteResponse": {
        "body": {
            "transferAmount": {
                "currency": "AED",
                "amount": "123.45"
            },
            "payeeReceiveAmount": {
                "currency": "AED",
                "amount": "123.45"
            },
            "payeeFspFee": {
                "currency": "AED",
                "amount": "123.45"
            },
            "payeeFspCommission": {
                "currency": "AED",
                "amount": "123.45"
            },
            "expiration": "2016-05-24T08:38:08.699-04:00",
            "geoCode": {
                "latitude": "+45.4215",
                "longitude": "+75.6972"
            },
            "ilpPacket": "AYIBgQAAAAAAAASwNGxldmVsb25lLmRmc3AxLm1lci45T2RTOF81MDdqUUZERmZlakgyOVc4bXFmNEpLMHlGTFGCAUBQU0svMS4wCk5vbmNlOiB1SXlweUYzY3pYSXBFdzVVc05TYWh3CkVuY3J5cHRpb246IG5vbmUKUGF5bWVudC1JZDogMTMyMzZhM2ItOGZhOC00MTYzLTg0NDctNGMzZWQzZGE5OGE3CgpDb250ZW50LUxlbmd0aDogMTM1CkNvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvbgpTZW5kZXItSWRlbnRpZmllcjogOTI4MDYzOTEKCiJ7XCJmZWVcIjowLFwidHJhbnNmZXJDb2RlXCI6XCJpbnZvaWNlXCIsXCJkZWJpdE5hbWVcIjpcImFsaWNlIGNvb3BlclwiLFwiY3JlZGl0TmFtZVwiOlwibWVyIGNoYW50XCIsXCJkZWJpdElkZW50aWZpZXJcIjpcIjkyODA2MzkxXCJ9IgA",
            "condition": "uRQYeuaSD7edpJL_DAC5FckEtfas14offtsCujC-o0t",
            "extensionList": {
                "extension": [
                    {
                        "key": "string",
                        "value": "string"
                    }
                ]
            }
        },
        "headers": {}
    },
    "quoteResponseSource": "string",
    "conversionRequestId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
    "fxQuotesResponse": {
        "body": {
            "homeTransactionId": "string",
            "condition": "7skjDKOH70-ftefIxNplA7YPJtGTGHpcrAeFbfP75yc",
            "conversionTerms": {
                "conversionId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
                "determiningTransferId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
                "initiatingFsp": "string",
                "counterPartyFsp": "string",
                "amountType": "RECEIVE",
                "sourceAmount": {
                    "currency": "AED",
                    "amount": "123.45"
                },
                "targetAmount": {
                    "currency": "AED",
                    "amount": "123.45"
                },
                "expiration": "2016-05-24T08:38:08.699-04:00",
                "charges": [
                    {
                        "chargeType": "string",
                        "sourceAmount": {
                            "currency": "AED",
                            "amount": "123.45"
                        },
                        "targetAmount": {
                            "currency": "AED",
                            "amount": "123.45"
                        }
                    }
                ],
                "extensionList": {
                    "extension": [
                        {
                            "key": "string",
                            "value": "string"
                        }
                    ]
                }
            }
        },
        "headers": {}
    },
    "fxQuotesResponseSource": "string",
    "fulfil": {
        "body": {
            "fulfilment": "WLctttbu2HvTsa1XWvUoGRcQozHsqeu9Ahl2JW9Bsu8",
            "completedTimestamp": "2016-05-24T08:38:08.699-04:00",
            "transferState": "RESERVED",
            "extensionList": {
                "extension": [
                    {
                        "key": "string",
                        "value": "string"
                    }
                ]
            }
        },
        "headers": {}
    },
    "lastError": {
        "httpStatusCode": 0,
        "mojaloopError": {
            "errorInformation": {
                "errorCode": "5100",
                "errorDescription": "string",
                "extensionList": {
                    "extension": [
                        {
                            "key": "string",
                            "value": "string"
                        }
                    ]
                }
            }
        }
    },
    "skipPartyLookup": true
});

export const sdkInitiateTransferResponseDto = (
    payeeFspCommissionAmount: string | undefined,
    payeeFspFeeAmount: string | undefined,
) => ({
    quoteResponse: {
        body: {
            payeeFspCommission: {
                amount: payeeFspCommissionAmount,
            },
            payeeFspFee: {
                amount: payeeFspFeeAmount,
            },
        },
    },
});

export const fineractCalculateWithdrawQuoteResponseDto = (feeAmount: number) => feeAmount;

export const validTransfer: TtransferRequest = {
    homeR2PTransactionId: 'string',
    amount: '499.03',
    amountType: 'SEND',
    currency: 'NGN',
    from: {
        dateOfBirth: '5704-02-29',
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
    ilpPacket: {
        data: {
            amount: {
                amount: '500',
                currency: 'NGN',
            },
            payee: {
                partyIdInfo: {
                    partyIdType: 'IBAN',
                    partyIdentifier: IBAN,
                },
            },
            payer: {
                partyIdInfo: {
                    partyIdType: 'MSISDN',
                    partyIdentifier: '820323232',
                },
            },
            quoteId: '27653e60-e21c-1414-8a35-0b5b97d5abc7',
            transactionId: '9fe8c410-5b31-188f-858f-67cb6b308198',
            transactionType: {
                initiator: 'PAYER',
                initiatorType: 'CONSUMER',
                scenario: 'TRANSFER',
                subScenario: 'string',
            },
        },
    },
    note: 'string',
    quote: {
        expiration: '5200-02-29T21:42:06.649-09:08',
        extensionList: [
            {
                key: 'string',
                value: 'string',
            },
        ],
        geoCode: {
            latitude: '90',
            longitude: '+6.06',
        },
        payeeFspCommissionAmount: '0.97',
        payeeFspCommissionAmountCurrency: 'NGN',
        payeeFspFeeAmount: '0',
        payeeFspFeeAmountCurrency: 'NGN',
        payeeReceiveAmount: '500',
        payeeReceiveAmountCurrency: 'NGN',
        quoteId: randomUUID(),
        transactionId: randomUUID(),
        transferAmount: '500',
        transferAmountCurrency: 'NGN',
    },
    quoteRequestExtensions: [
        {
            key: 'string',
            value: 'string',
        },
    ],
    subScenario: 'string',
    to: {
        dateOfBirth: '3956-02-29',
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
    transactionType: 'TRANSFER',
    transferId: randomUUID(),
    transactionRequestId: randomUUID(),
};
export const invalidIBANTransfer: TtransferRequest = {
    homeR2PTransactionId: 'string',
    amount: '500',
    amountType: 'SEND',
    currency: 'NGN',
    from: {
        dateOfBirth: '5704-02-29',
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
    ilpPacket: {
        data: {
            amount: {
                amount: '500',
                currency: 'NGN',
            },
            payee: {
                partyIdInfo: {
                    partyIdType: 'IBAN',
                    partyIdentifier: IBAN,
                },
            },
            payer: {
                partyIdInfo: {
                    partyIdType: 'MSISDN',
                    partyIdentifier: '820323232',
                },
            },
            quoteId: '27653e60-e21c-1414-8a35-0b5b97d5abc7',
            transactionId: '9fe8c410-5b31-188f-858f-67cb6b308198',
            transactionType: {
                initiator: 'PAYER',
                initiatorType: 'CONSUMER',
                scenario: 'TRANSFER',
                subScenario: 'string',
            },
        },
    },
    note: 'string',
    quote: {
        expiration: '5200-02-29T21:42:06.649-09:08',
        extensionList: [
            {
                key: 'string',
                value: 'string',
            },
        ],
        geoCode: {
            latitude: '90',
            longitude: '+6.06',
        },
        payeeFspCommissionAmount: '0.97',
        payeeFspCommissionAmountCurrency: 'NGN',
        payeeFspFeeAmount: '0',
        payeeFspFeeAmountCurrency: 'NGN',
        payeeReceiveAmount: '0',
        payeeReceiveAmountCurrency: 'NGN',
        quoteId: randomUUID(),
        transactionId: randomUUID(),
        transferAmount: '500',
        transferAmountCurrency: 'NGN',
    },
    quoteRequestExtensions: [
        {
            key: 'string',
            value: 'string',
        },
    ],
    subScenario: 'string',
    to: {
        dateOfBirth: '3956-02-29',
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
        idValue: "U9S9999",
        lastName: 'string',
        merchantClassificationCode: 'string',
        middleName: 'string',
        type: 'CONSUMER',
    },
    transactionType: 'TRANSFER',
    transferId: randomUUID(),
    transactionRequestId: randomUUID(),
};
export const invalidQuoteTransfer: TtransferRequest = {
    homeR2PTransactionId: 'string',
    amount: '200',
    amountType: 'SEND',
    currency: 'NGN',
    from: {
        dateOfBirth: '5704-02-29',
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
    ilpPacket: {
        data: {
            amount: {
                amount: '500',
                currency: 'NGN',
            },
            payee: {
                partyIdInfo: {
                    partyIdType: 'IBAN',
                    partyIdentifier: IBAN,
                },
            },
            payer: {
                partyIdInfo: {
                    partyIdType: 'MSISDN',
                    partyIdentifier: '820323232',
                },
            },
            quoteId: '27653e60-e21c-1414-8a35-0b5b97d5abc7',
            transactionId: '9fe8c410-5b31-188f-858f-67cb6b308198',
            transactionType: {
                initiator: 'PAYER',
                initiatorType: 'CONSUMER',
                scenario: 'TRANSFER',
                subScenario: 'string',
            },
        },
    },
    note: 'string',
    quote: {
        expiration: '5200-02-29T21:42:06.649-09:08',
        extensionList: [
            {
                key: 'string',
                value: 'string',
            },
        ],
        geoCode: {
            latitude: '90',
            longitude: '+6.06',
        },
        payeeFspCommissionAmount: '0.97',
        payeeFspCommissionAmountCurrency: 'NGN',
        payeeFspFeeAmount: '0',
        payeeFspFeeAmountCurrency: 'NGN',
        payeeReceiveAmount: '0',
        payeeReceiveAmountCurrency: 'NGN',
        quoteId: randomUUID(),
        transactionId: randomUUID(),
        transferAmount: '500',
        transferAmountCurrency: 'NGN',
    },
    quoteRequestExtensions: [
        {
            key: 'string',
            value: 'string',
        },
    ],
    subScenario: 'string',
    to: {
        dateOfBirth: '3956-02-29',
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
    transactionType: 'TRANSFER',
    transferId: randomUUID(),
    transactionRequestId: randomUUID(),
};

export const getQuote = (IdType: components["schemas"]["PartyIdType"] = "IBAN", Id: string = IBAN ): fspiopComponents['schemas']['QuotesPostRequest'] => ({
    "quoteId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
    "transactionId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
    "transactionRequestId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
    "payee": {
        "partyIdInfo": {
            "partyIdType":IdType,
            "partyIdentifier": Id,
            "partySubIdOrType": IdType,
            "fspId": "string",
            "extensionList": {
                "extension": [
                    {
                        "key": "string",
                        "value": "string"
                    }
                ]
            }
        },
        "merchantClassificationCode": "2212",
        "name": "string",
        "personalInfo": {
            "complexName": {
                "firstName": "Henrik",
                "middleName": "Johannes",
                "lastName": "Karlsson"
            },
            "dateOfBirth": "1966-06-16",
            "kycInformation": "{\n    \"metadata\": {\n        \"format\": \"JSON\",\n        \"version\": \"1.0\",\n        \"description\": \"Data containing KYC Information\"\n    },\n    \"data\": {\n        \"name\": \"John Doe\",\n        \"dob\": \"1980-05-15\",\n        \"gender\": \"Male\",\n        \"address\": \"123 Main Street, Anytown, USA\",\n        \"email\": \"johndoe@example.com\",\n        \"phone\": \"+1 555-123-4567\",\n        \"nationality\": \"US\",\n        \"passport_number\": \"AB1234567\",\n        \"issue_date\": \"2010-02-20\",\n        \"expiry_date\": \"2025-02-20\",\n        \"bank_account_number\": \"1234567890\",\n        \"bank_name\": \"Example Bank\",\n        \"employer\": \"ABC Company\",\n        \"occupation\": \"Software Engineer\",\n        \"income\": \"$80,000 per year\",\n        \"marital_status\": \"Single\",\n        \"dependents\": 0,\n        \"risk_level\": \"Low\"\n    }\n}"
        },
        "supportedCurrencies": [
            "AED"
        ]
    },
    "payer": {
        "partyIdInfo": {
            "partyIdType": "MSISDN",
            "partyIdentifier": "16135551212",
            "partySubIdOrType": "string",
            "fspId": "string",
            "extensionList": {
                "extension": [
                    {
                        "key": "string",
                        "value": "string"
                    }
                ]
            }
        },
        "merchantClassificationCode": "9",
        "name": "string",
        "personalInfo": {
            "complexName": {
                "firstName": "Henrik",
                "middleName": "Johannes",
                "lastName": "Karlsson"
            },
            "dateOfBirth": "1966-06-16",
            "kycInformation": "{\n    \"metadata\": {\n        \"format\": \"JSON\",\n        \"version\": \"1.0\",\n        \"description\": \"Data containing KYC Information\"\n    },\n    \"data\": {\n        \"name\": \"John Doe\",\n        \"dob\": \"1980-05-15\",\n        \"gender\": \"Male\",\n        \"address\": \"123 Main Street, Anytown, USA\",\n        \"email\": \"johndoe@example.com\",\n        \"phone\": \"+1 555-123-4567\",\n        \"nationality\": \"US\",\n        \"passport_number\": \"AB1234567\",\n        \"issue_date\": \"2010-02-20\",\n        \"expiry_date\": \"2025-02-20\",\n        \"bank_account_number\": \"1234567890\",\n        \"bank_name\": \"Example Bank\",\n        \"employer\": \"ABC Company\",\n        \"occupation\": \"Software Engineer\",\n        \"income\": \"$80,000 per year\",\n        \"marital_status\": \"Single\",\n        \"dependents\": 0,\n        \"risk_level\": \"Low\"\n    }\n}"
        },
        "supportedCurrencies": [
            "AED"
        ]
    },
    "amountType": "RECEIVE",
    "amount": {
        "currency": "AED",
        "amount": "123.45"
    },
    "fees": {
        "currency": "AED",
        "amount": "123.45"
    },
    "transactionType": {
        "scenario": "DEPOSIT",
        "subScenario": "LOCALLY_DEFINED_SUBSCENARIO",
        "initiator": "PAYEE",
        "initiatorType": "CONSUMER",
        "refundInfo": {
            "originalTransactionId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
            "refundReason": "Free text indicating reason for the refund."
        },
        "balanceOfPayments": "123"
    },
    "converter": "PAYER",
    "currencyConversion": {
        "sourceAmount": {
            "currency": "AED",
            "amount": "123.45"
        },
        "targetAmount": {
            "currency": "AED",
            "amount": "123.45"
        }
    },
    "geoCode": {
        "latitude": "+45.4215",
        "longitude": "+75.6972"
    },
    "note": "Note sent to Payee.",
    "expiration": "2016-05-24T08:38:08.699-04:00",
    "extensionList": {
        "extension": [
            {
                "key": "string",
                "value": "string"
            }
        ]
    }
});

export const getPatchNotificationBody = (
    currentState: components['schemas']['transferStatus'],
    IdType: components["schemas"]["PartyIdType"] = "IBAN",
    Id: string = IBAN
) : TtransferPatchNotificationRequest =>( {
    "currentState": currentState,
    "direction": "INBOUND",
    "finalNotification": {
        "completedTimestamp": "5200-02-29T06:54:23.605Z",
        "extensionList": [
            {
                "key": "string",
                "value": "string"
            }
        ],
        "transferState": "RECEIVED"
    },
    "fulfil": {
        "body": {},
        "headers": {}
    },
    "initiatedTimestamp": "8800-02-29T23:12:30.109Z",
    "lastError": {
        "httpStatusCode": 0,
        "mojaloopError": {
            "errorInformation": {
                "errorCode": "5100",
                "errorDescription": "string",
                "extensionList": {
                    "extension": [
                        {
                            "key": "string",
                            "value": "string"
                        }
                    ]
                }
            }
        }
    },
    "prepare": {
        "body": {},
        "headers": {}
    },
    "quote": {
        "fulfilment": "string",
        "internalRequest": {},
        "mojaloopResponse": {},
        "request": {},
        "response": {}
    },
    "quoteRequest": {
        "body": getQuote(IdType,Id),
        "headers": {}
    },
    "quoteResponse": {
        "body": {},
        "headers": {}
    },
    "transferId": "dd78e6ef-5117-542f-80d1-edbf55334b32"
});

export const getSendTransferRequestBody = ( accountId: number, amount: string ): TFineractOutboundTransferRequest =>(
    {
        homeTransactionId: 'string',
        amount: amount,
        amountType: 'SEND',
        currency: 'AED',
        from: {
            fineractAccountId: accountId,
            payer: {
                dateOfBirth: '8477-05-21',
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
                idValue: 'string',
                lastName: 'string',
                merchantClassificationCode: '1234',
                middleName: 'string',
                type: 'CONSUMER',
            },
        },
        to: {
            dateOfBirth: '8477-05-21',
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
            merchantClassificationCode: '1234',
            middleName: 'string',
            type: 'CONSUMER',
        },
        note: 'string',
        quoteRequestExtensions: [
            {
                key: 'string',
                value: 'string',
            },
        ],
        subScenario: 'HELLO',
        transactionType: 'TRANSFER',
    }
);