import { FastifyInstance,FastifyPluginAsync } from "fastify";
import orderService from "../services/orderService";
import { StoreAuthorizationHeader } from "../DTO/index.dto";
import * as Order from "../DTO/order.dto";

const api: FastifyPluginAsync =  async (server: FastifyInstance) => {
    server.post<{
        Headers: StoreAuthorizationHeader,
        Body: Order.requestNewOrder,
        Reply: {
            200: Order.responseNewOrder,
            '4xx': undefined
        }
    }>('/', async (request, reply) => {
        if(!request.headers.storeid || !request.headers.authorization) {
            return reply
                .code(400)
                .send();
        }

        try{
            const result = await orderService.order(request.headers, request.body);
            reply
                .code(200)
                .send(result);
        }
        catch(e) {
            return reply
                .code(404)
                .send();
        }
    });

    server.post<{
        Headers: StoreAuthorizationHeader,
        Body: Order.requestPay,
        Reply: {
            200: Order.responsePay,
            '4xx': undefined
        }
    }>('/pay', async (request, reply) => {
        if(!request.headers.storeid || !request.headers.authorization) {
            return reply
                .code(400)
                .send();
        }

        try{
            const result = await orderService.pay(request.headers, request.body);
            reply
                .code(200)
                .send(result);
        }
        catch(e) {
            console.log(e);
            return reply
                .code(404)
                .send();
        }
    });

    server.get<{
        Headers: StoreAuthorizationHeader,
        Params: Order.requestGetOrder,
        Reply: {
            200: Order.responseGetOrder,
            '4xx': undefined
        }
    }>('/:orderId', async (request, reply) => {
        if(!request.headers.storeid || !request.headers.authorization|| !request.params.orderId) {
            return reply
                .code(400)
                .send();
        }

        try{
            const result = await orderService.getOrder(request.headers, request.params);
            reply
                .code(200)
                .send(result);
        }
        catch(e) {
            return reply
                .code(404)
                .send();
        }
    });

    server.get<{
        Headers: StoreAuthorizationHeader,
        Querystring: Order.requestGetOrderList,
        Reply: {
            200: Order.responseGetOrderList,
            '4xx': undefined
        }
    }>('/', async (request, reply) => {
        if(!request.headers.storeid || !request.headers.authorization || !request.query.page || !request.query.count) {
            return reply
                .code(400)
                .send();
        }

        try{
            const result = await orderService.getOrderList(request.headers, request.query);
            reply
                .code(200)
                .send(result);
        }
        catch(e) {
            return reply
                .code(404)
                .send();
        }
    });
}

export default api;
