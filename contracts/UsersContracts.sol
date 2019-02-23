pragma solidity ^0.4.24;

contract UsersContract {

    // Estructura basica de usuarios
    struct User{
        string name;
        string surname;
    }
    // Método que enlazara direcciones de Ethereum con usuarios
    mapping(address => User) private users;
    // Mapeo que indica si un usuario ya se ha registrado con una dirección 
    mapping(address => bool) private joinedUsers;
    // Array de direcciones de usuarios registrados
    address[] total;
    // Evento para mostrar datos del usuario cuando se registra
    //event onUserJoin(address, string);
    // Persiste en el storage el nuevo usuario  (otra forma seria almacenarlo en el memory pero no persistirian los cambios)
    function join(string name, string surname) public {
        require(!userJoined(msg.sender));
        User storage user = users[msg.sender]; // Inicializa un usuario con indice 'addres' del que invoca el contrato
        user.name = name;                      // Se inicializa con los campos vacios "''", por lo que se han de establecer los valores 
        user.surname = surname;
        joinedUsers[msg.sender] = true;        // establecemos como true el valor del mapping 'joinedUsers' para esa dirección
        total.push(msg.sender); 
        //onUserJoin(msg.sender, string(abi.encodePacked(name, " ", surname))); // abi.encodePacked(arg); concatena strings en Solidity  
    }
    // Obtiene los valores de nombre y apellidos con los que se ha registrado el usuario del address, 'view' solo obtiene datos y los devuelve tipados
    function getUser(address addr) public view returns(string, string){
        require(userJoined(msg.sender), "false");
        User memory user = users[addr]; // Obtenemos el usuario del mapping usando el address y lo almacenamos en memoria 'No guardaremos nada'
        return (user.name, user.surname);
    } 
    // Comprueba si existe un usuario con esa dirección y devuelve true / false
    function userJoined(address addr) private view returns (bool){
        return joinedUsers[addr];
    }
    // Devuelve el numero de usuarios registrados en el contrato 'unsigned integer' entero positivo
    function totalUsers() public view returns (uint){
        return total.length;
    }
}