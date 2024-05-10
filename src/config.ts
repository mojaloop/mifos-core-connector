import Convict from 'convict';
import { IdType, TFineractConfig } from './domain/FineractClient/types';
import { TSDKSchemeAdapterConfig } from './domain/SDKClient';

interface IConfigSchema {
    fineract: TFineractConfig;
    server: {
        SDK_SERVER_HOST: string;
        SDK_SERVER_PORT: number;
        DFSP_SERVER_HOST: string;
        DFSP_SERVER_PORT: number;
    };
    sdkSchemeAdapter: TSDKSchemeAdapterConfig;
}

// todo: use this config instead of CONFIG
const config = Convict<IConfigSchema>({
    fineract: {
        FINERACT_BASE_URL: {
            doc: 'FINERACT_BASE_URL', // todo: add proper description
            format: String,
            default: null, // required
            env: 'FINERACT_BASE_URL',
        },
        FINERACT_TENANT_ID: {
            doc: 'FINERACT_TENANT_ID',
            format: String,
            default: null,
            env: 'FINERACT_TENANT_ID',
        },
        FINERACT_AUTH_MODE: {
            doc: 'FINERACT_AUTH_MODE', // todo: add proper description
            format: String,
            default: null, // required
            env: 'FINERACT_AUTH_MODE',
        },
        FINERACT_USERNAME: {
            doc: 'FINERACT_USERNAME', // todo: add proper description
            format: String,
            default: null, // required
            env: 'FINERACT_USERNAME',
        },
        FINERACT_PASSWORD: {
            doc: 'FINERACT_PASSWORD', // todo: add proper description
            format: String,
            default: null, // required
            env: 'FINERACT_PASSWORD',
        },
        FINERACT_BANK_ID: {
            doc: 'FINERACT_BANK_ID', // todo: add proper description
            format: String,
            default: null, // required
            env: 'FINERACT_BANK_ID',
        },
        FINERACT_ACCOUNT_PREFIX: {
            doc: 'FINERACT_ACCOUNT_PREFIX', // todo: add proper description
            format: String,
            default: null, // required
            env: 'FINERACT_ACCOUNT_PREFIX',
        },
        FINERACT_BANK_COUNTRY_CODE: {
            doc: 'FINERACT_BANK_COUNTRY_CODE', // todo: add proper description
            format: String,
            default: null, // required
            env: 'FINERACT_BANK_COUNTRY_CODE',
        },
        FINERACT_CHECK_DIGITS: {
            doc: 'FINERACT_CHECK_DIGITS', // todo: add proper description
            format: String,
            default: null, // required
            env: 'FINERACT_CHECK_DIGITS',
        },
        FINERACT_ID_TYPE: {
            doc: 'FINERACT_CHECK_DIGITS', // todo: add proper description
            format: String,
            default: IdType.IBAN,
        },
        FINERACT_LOCALE: {
            doc: 'FINERACT_LOCALE', // todo: add proper description
            format: String,
            default: null, // required
            env: 'FINERACT_LOCALE',
        },
    },
    server: {
        SDK_SERVER_HOST: {
            doc: 'SDK Server host',
            format: String,
            default: null, // required
            env: 'SDK_SERVER_HOST',
        },
        SDK_SERVER_PORT: {
            doc: 'SDK Server port',
            format: Number,
            default: 3000, // optional
            env: 'SDK_SERVER_PORT',
        },
        DFSP_SERVER_HOST: {
            doc: 'DFSP operations app Server host',
            format: String,
            default: null, // required
            env: 'DFSP_SERVER_HOST',
        },
        DFSP_SERVER_PORT: {
            doc: 'dfsp operations app Server port',
            format: Number,
            default: null, // required
            env: 'DFSP_SERVER_PORT',
        },
    },
    sdkSchemeAdapter: {
        SDK_BASE_URL: {
            doc: 'SDK Scheme Adapter Base URL',
            format: String,
            default: null, // required
            env: 'SDK_BASE_URL',
        },
    },
});

config.validate({ allowed: 'strict' });

export type TConfig = Convict.Config<IConfigSchema>;

export default config;
