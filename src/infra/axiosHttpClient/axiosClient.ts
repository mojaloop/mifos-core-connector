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

 "use strict";

import axios, { AxiosHeaders } from "axios";
import { THttpResponse,TRequestOptions } from "../../domain";
import { IHttpClient } from "../../domain";

// todo: it's better to use more generic name: HttpClient
 export class AxiosHttpClient implements IHttpClient{
     async send<R = unknown>(url: string, options: TRequestOptions): Promise<THttpResponse<R> | undefined> {
        const method  = options.method;
        const data = JSON.stringify(options.payload);
        const timeout = options.timeout_ms;
        const headers = options.headers as AxiosHeaders;

        try {
            const res = await axios.request({
                url,
                method,
                data,
                timeout,
                headers
            });
            return {data: res.data, statusCode: res.status};
        } catch (error) {
            console.error(error); // todo. Replace with a proper logger
            return;
            // todo: I'd suggest rethrowing the error from the httpClient, and allow code, which uses it to handle it as needed
        }
     }

 }
