import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";

class SignalRService {
    private connection: HubConnection;

    constructor() {
        this.connection = new HubConnectionBuilder()
            .withUrl(`https://localhost:7069/todoHub`)
            .build();

        this.connection.start()
            .then(() => console.log("SignalR connected"))
            .catch(err => console.error("SignalR connection error: ", err));

        this.connection.on("ReceiveTodoUpdate", (id: number, title: string, description: string) => {
            console.log("Todo updated:", { id, title, description });
        });
    }

}

const signalRService = new SignalRService();
export default signalRService;
