import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import {repository} from '@loopback/repository';
import { LLaves } from '../config/llaves';
import { Persona } from '../models';
import {PersonaRepository} from '../repositories';

const generador = require("password-generator");
const cryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

@injectable({scope: BindingScope.TRANSIENT})
export class AutenticacionService {
  constructor(
    @repository(PersonaRepository)
    public personaRepository: PersonaRepository
  ) {}
  
  GenerarClave(){
    let clave = generador(8, false);
    return clave;
  }
  
  CifrarClave(clave: string){
    let claveCifrada = cryptoJS.MD5(clave).toString();
    return claveCifrada;
  }
  //Autenticacion
  IdentificarPersona(usuario: string, clave: string){
    try {
      let p = this.personaRepository.findOne({where : {correo: usuario,clave: clave}});
      if(p){
        return p;
      }
      return false;
    } catch {
      return false;
    }
  }

  GenerarTokenJWT(persona: Persona) {
    let token = jwt.sign({
      data: {
        id: persona.id,
        correo: persona.correo,
        nombre: persona.nombres + " " + persona.apellidos
        //roll: persona.roll = Administrador
      }
    }, LLaves.claveJWT);
  return token;
  }
  ValidarTokenJWT(token: string){
    try{
      let datos = jwt.verify(token, LLaves.claveJWT);
      return datos;

    }catch{
      return false;

    }

  }

}
