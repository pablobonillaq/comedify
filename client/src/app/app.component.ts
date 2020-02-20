import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { GLOBAL } from './services/global';
import { UserService } from './services/user.service';
import { User } from './models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [UserService]
})

export class AppComponent implements OnInit{
  public title = 'MUSIFY';
  public user: User;
  public user_register: User;
  public identity;
  public token;
  public errorMessage;
  public alertRegister;
  public url: string;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService:UserService
    )
  {
  	this.user = new User('', '', '', '', '', 'ROLE_USER', '');
    this.user_register = new User('', '', '', '', '', 'ROLE_USER', '');
  }

  ngOnInit()
  {
  	this.identity = this._userService.getIndentity();
    this.token = this._userService.getToken();
    this.url = GLOBAL.url;
  }

  public onSubmit()
  {
  	console.log(this.user);

    //Conseguir los datos del usuario identificado
  	this._userService.signup(this.user).subscribe(
  		response => {
  			let identity = response.user;
        this.identity = identity;

        if(!this.identity._id)
        {
          alert("El usuario no está correctamente identificado.");
        }
        else
        {
          //Crear elemento en el Local Storage para tener al usuario en sesión

          //Conseguir el token para enviárselo a cada petición http

          localStorage.setItem('identity', JSON.stringify(identity));
          this._userService.signup(this.user, 'true').subscribe(
            response => {
              let token = response.token;
              this.token = token;

              if(this.token.length <= 0)
              {
                alert("El token no se ha generado.");
              }
              else
              {
                //Crear elemento en el local storage para tener token disponible
                localStorage.setItem('token', token);
                this._router.navigate(['/']);
              }
            },
            error => {
              var errorMessage = <any>error;

              if(errorMessage != null)
              {
                var body = JSON.parse(error._body);
                this.errorMessage = body.message;
                console.log(error);
              }
            });
        }
  		},
  		error => {
  			var errorMessage = <any>error;

  			if(errorMessage != null)
  			{
          var body = JSON.parse(error._body);
          this.errorMessage = body.message;
  				console.log(error);
  			}
  		});
  }

  public logout()
  {
    localStorage.removeItem('identity');
    localStorage.removeItem('token');
    localStorage.clear();
    this.identity = null;
    this.token = null;
    this.user = new User('', '', '', '', '', 'ROLE_USER', ''); 
    this._router.navigate(['/']);
  }

  public onSubmitRegister()
  {
    console.log(this.user_register);

    this._userService.register(this.user_register).subscribe(
      response => {
        let user = response.user;

        this.user_register = user;

        if(!user._id)
        {
          this.alertRegister = "Error al registrarse";
        }
        else
        {
          this.alertRegister = "El registro se ha realizado correctamente. Identifícate con " + this.user_register.email;
          this.user_register = new User('', '', '', '', '', 'ROLE_USER', '');
        }
      },
      error =>{
        var errorMessage = <any>error;

        if(errorMessage != null)
        {
          var body = JSON.parse(error._body);
          this.alertRegister = body.message;
          console.log(error);
        }
      });
  }
}
