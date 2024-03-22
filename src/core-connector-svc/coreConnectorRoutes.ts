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

import { Request, ResponseToolkit } from "@hapi/hapi";
import { ReqRefDefaults, ServerRoute } from "@hapi/hapi/lib/types";
import { CoreConnectorAggregate } from "src/domain/coreConnectorAgg";
import { ILogger, IRoutes, TQuoteRequest } from "src/domain/interfaces";

export class CoreConnectorRoutes implements IRoutes{
    private readonly aggregate: CoreConnectorAggregate;
    private readonly routes: ServerRoute<ReqRefDefaults>[] = [];
    private readonly logger : ILogger;

    constructor(aggregate: CoreConnectorAggregate, logger: ILogger){
        this.aggregate = aggregate;
        this.logger = logger.child({context:"MCC Core Connector Routes"});

        this.routes.push({
            method: ["GET"],
            path: `/parties/${this.aggregate.IdType.toString()}/{ID}`,
            handler: this.getParties.bind(this)
        });

        this.routes.push({
           method: ["POST"],
           path: `/quoterequests`,
           handler: this.quoteRequests.bind(this) 
        });
    }

    getRoutes(): ServerRoute<ReqRefDefaults>[] {
        return this.routes;
    }

    private async getParties(request: Request, h: ResponseToolkit){ //todo change to openapi signature
        this.logger.info("Received GET request /parties/{IdType}/{ID}");
        const IBAN = request.params["ID"];

        const result = await this.aggregate.getParties(IBAN);

        if(!result){
            return h.response({"statusCode":"3204", "message":"Party not found"}).code(404);
        }else{
            return h.response(result.data).code(200);
        }
    }

    private async quoteRequests(request: Request, h:ResponseToolkit){
        this.logger.info("Raeceived POST request /quoterequests");
        const quote = request.payload as TQuoteRequest;

        const result = await this.aggregate.quoterequest(quote);

        if(!result){
            return h.response({"statusCode":"3204", "message":"Party not found"}).code(404);
        }else{
            return h.response(result).code(200);
        }
    }
}

