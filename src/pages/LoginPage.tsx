import { observer } from "mobx-react-lite";
    import { Login } from "../components/Login/Login";

const LoginPage = () => {

    return (
        <div className="loginContainer">
            <Login />
        </div>
    )
};

export default observer(LoginPage);