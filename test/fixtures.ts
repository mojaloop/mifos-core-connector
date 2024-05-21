import { TUpdateTransferDeps } from '../src/domain/SDKClient';
import { TFineractGetAccountResponse, TFineractTransactionResponse } from '../src/domain/FineractClient';

type TransferAcceptInputDto = {
    fineractAccountId?: number;
    totalAmount?: number;
    sdkTransferId?: number;
};

export const transferAcceptDto = ({
    fineractAccountId = 1,
    totalAmount = 123.45,
    sdkTransferId = 999,
}: TransferAcceptInputDto = {}): TUpdateTransferDeps => ({
    fineractTransaction: {
        fineractAccountId,
        totalAmount,
        routingCode: 'routingCode',
        receiptNumber: 'receiptNumber',
        bankNumber: 'bankNumber',
    },
    sdkTransferId,
} as const);

// todo: make it configurable, add all required fields
export const fineractGetAccountResponseDto = (): Partial<TFineractGetAccountResponse> => ({
        id: 'id',
        accountNo: 'accountNo',
        clientId: 123,
        clientName: 'clientName',
    }) as const;

// todo: make it configurable,
export const fineractTransactionResponseDto = (): TFineractTransactionResponse => ({
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