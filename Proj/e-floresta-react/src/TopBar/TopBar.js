import './TopBar.css'

const TopBar = (props) => {
    return (
      <div class="top">
        <div class="title">
          <h1>{props.name}</h1>
        </div>

        <input class="session-button" type="button" value="Login | Criar Utilizador" onclick="location.href='create-and-login.html'"/>
      </div>
    )
  }

  export default TopBar;