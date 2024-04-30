import { IHTTPClient, ILogger, THttpResponse } from '../interfaces';

export enum IdType {
    MSISDN = 'MSISDN',
    IBAN = 'IBAN',
    ACCOUNT_NO = 'ACCOUNT_NO',
    EMAIL = 'EMAIL',
    PERSONAL_ID = 'PERSONAL_ID',
    BUSINESS = 'BUSINESS',
    DEVICE = 'DEVICE',
    ACCOUNT_ID = 'ACCOUNT_ID',
    ALIAS = 'ALIAS',
}

export enum PartyType {
    CONSUMER = 'CONSUMER',
    AGENT = 'AGENT',
    BUSINESS = 'BUSINESS',
    DEVICE = 'DEVICE',
}

// maybe, we can remove prefix FINERACT_ from all fileds?
export type TFineractConfig = {
    FINERACT_BASE_URL: string;
    FINERACT_TENANT_ID: string;
    FINERACT_AUTH_MODE: string;
    FINERACT_USERNAME: string;
    FINERACT_PASSWORD: string;
    FINERACT_BANK_ID: string;
    FINERACT_ACCOUNT_PREFIX: string;
    FINERACT_BANK_COUNTRY_CODE: string;
    FINERACT_CHECK_DIGITS: string;
    FINERACT_ID_TYPE: IdType;
    FINERACT_LOCALE: string;
};

export type Payee = {
    full_name: string; // todo: try to avoid using camelCase and snake_case across code
};

export enum FineractLookupStage {
    SEARCH = 'search',
    SAVINGSACCOUNT = 'savingsaccount',
    CLIENT = 'client',
}

export type TLookupResponseInfo = {
    data: TFineractGetClientResponse | undefined;
    message: string;
    status: number;
    stage: FineractLookupStage;
    currency?: string;
    accountId?: number;
    accountStatus?: boolean;
};

export type TAccountEntity = {
    entityId: number;
    entityAccountNo: string;
    entityName: string;
    entityType: string;
    parentId: number;
    parentName: string;
    entityStatus: unknown;
    parentType: string;
    subEntityType: string;
};

export type TFineractSearchResponse = TAccountEntity[];

export type TFineractAccountStatus = {
    id: number;
    code: string;
    value: string;
    submittedAndPendingApproval: boolean;
    approved: boolean;
    rejected: boolean;
    withdrawnByApplicant: boolean;
    active: boolean;
    closed: boolean;
    prematureClosed: boolean;
    transferInProgress: boolean;
    transferOnHold: boolean;
    matured: boolean;
};

// todo: are all fields required?
export type TFineractGetAccountResponse = {
    id: string;
    accountNo: string;
    depositType: unknown;
    clientId: number;
    clientName: string;
    savingsProductId: number;
    savingsProductName: string;
    fieldOfficerId: number;
    status: TFineractAccountStatus;
    subStatus: unknown;
    timeline: unknown;
    currency: {
        code: string;
        name: string;
        decimalPlaces: number;
        inMultiplesOf: number;
        nameCode: number;
        displayLabel: number;
    };
    nominalAnnualInterestRate: number;
    interestCompoundingPeriodType: unknown;
    interestPostingPeriodType: unknown;
    interestCalculationType: unknown;
    interestCalculationDaysInYearType: unknown;
    withdrawalFeeForTransfers: boolean;
    allowOverdraft: boolean;
    enforceMinRequiredBalance: boolean;
    withHoldTax: boolean;
    lastActiveTransactionDate: [];
    isDormancyTrackingActive: boolean;
    daysToInactive: number;
    daysToDormancy: number;
    daysToEscheat: number;
    summary: unknown;
};

export type TFineractGetClientResponse = {
    id: number;
    accountNo: string;
    status: {
        id: number;
        code: string;
        value: string;
    };
    subStatus: {
        active: boolean;
        mandatory: boolean;
    };
    active: boolean;
    activationDate: [];
    firstname: string;
    lastname: string;
    displayName: string;
    gender: {
        active: boolean;
        mandatory: boolean;
    };
    clientType: {
        active: boolean;
        mandatory: boolean;
    };
    clientClassification: {
        active: boolean;
        mandatory: boolean;
    };
    isStaff: boolean;
    officeId: number;
    officeName: string;
    staffId: number;
    staffName: string;
    timeline: {
        submittedOnDate: [];
        submittedByUsername: string;
        submittedByFirstname: string;
        submittedByLastname: string;
        activatedOnDate: [];
        activatedByUsername: string;
        activatedByFirstname: string;
        activatedByLastname: string;
    };
    clientCollateralManagements: [];
    groups: [];
    clientNonPersonDetails: {
        constitution: {
            active: boolean;
            mandatory: boolean;
        };
        mainBusinessLine: {
            active: boolean;
            mandatory: boolean;
        };
    };
};

export interface IFineractClient {
    fineractConfig: TFineractConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
    lookupPartyInfo(accountNo: string): Promise<TLookupResponseInfo | undefined>;
    calculateQuote(quoteDeps: TCalculateQuoteDeps): Promise<TCalculateQuoteResponse | undefined>;
    receiveTransfer(transferDeps: TFineracttransferDeps): Promise<TFineractTransactionResponse | undefined>;
    getAccountFineractIdWithAccountNo(accountNo: string): Promise<TLookupResponseInfo | undefined>;
    sendTransfer(transactionPayload: TFineracttransferDeps): Promise<THttpResponse<TFineractTransactionResponse>>;
}

export type TFineractClientFactoryDeps = {
    fineractConfig: TFineractConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
};

export type TCalculateQuoteDeps = {
    accountNo: string;
};

export type TCalculateQuoteResponse = TLookupResponseInfo;

export type TFineractTransactionPayload = {
    locale: string;
    dateFormat: string;
    transactionDate: string;
    transactionAmount: string;
    paymentTypeId: string;
    accountNumber: string;
    routingCode: string;
    receiptNumber: string;
    bankNumber: string;
};

export type TFineracttransferDeps = {
    accountId: number;
    transaction: TFineractTransactionPayload;
};

export type TFineractTransactionResponse = {
    officeId: number;
    clientId: number;
    savingsId: number;
    resourceId: number;
    changes: {
        accountNumber: string;
        routingCode: string;
        receiptNumber: string;
        bankNumber: string;
    };
};
