import Convict from 'convict';
import { IdType, TFineractConfig } from './domain/FineractClient/types';

interface IConfigSchema {
    fineract: TFineractConfig;
    server: {
        host: string;
        port: number;
    };
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
        host: {
            doc: 'Server host',
            format: String,
            default: null, // required
            env: 'HOST',
        },
        port: {
            doc: 'Server port',
            format: Number,
            default: 3000, // optional
            env: 'PORT',
        },
    },
});

config.validate({ allowed: 'strict' });

export type TConfig = Convict.Config<IConfigSchema>;

export default config;
