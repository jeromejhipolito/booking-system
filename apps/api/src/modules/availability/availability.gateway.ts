import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/availability',
})
export class AvailabilityGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AvailabilityGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribeProvider')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { providerId: string },
  ) {
    const room = `provider:${data.providerId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} subscribed to ${room}`);
    return { event: 'subscribed', data: { room } };
  }

  @SubscribeMessage('unsubscribeProvider')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { providerId: string },
  ) {
    const room = `provider:${data.providerId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} unsubscribed from ${room}`);
    return { event: 'unsubscribed', data: { room } };
  }

  /**
   * Notify all clients subscribed to a provider's room about availability changes
   */
  notifyAvailabilityChange(providerId: string, date: string) {
    const room = `provider:${providerId}`;
    this.server.to(room).emit('availabilityUpdated', {
      providerId,
      date,
      timestamp: new Date().toISOString(),
    });
  }
}
