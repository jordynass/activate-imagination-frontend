import { io } from "socket.io-client";
import { getSocket } from "./SocketFactory";

jest.mock("socket.io-client", () => ({
  io: jest.fn(),
}));

describe("getSocket socket factory", () => {
  it("should pass the x-game-id header", () => {
    const gameId = "testGameId";
    getSocket(gameId);

    expect(io).toHaveBeenCalledWith(expect.any(String), {
      extraHeaders: {
        'x-game-id': gameId,
      },
    });
  });
});
