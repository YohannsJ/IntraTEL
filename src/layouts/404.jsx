import { Outlet, Link } from 'react-router-dom';
import React from 'react';
const NotFoundPage = () => (
  <div  style={{ textAlign: 'center', marginTop: '4rem' }}>
    <h1>Error <a href='https://es.wikipedia.org/wiki/HTTP_404' >HTTP_404 👀</a></h1>
    <h2>¿Andas perdido?</h2>
    
    <p>Asi que quieres banderas eh? Pues aqui no hay :/</p>
    <img src="https://i.makeagif.com/media/12-08-2015/SDSl7K.gif" alt="404 Not Found"/>
    <p flag="D1FTEL{M3NT3_CUR10S4}">¿O si? <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">😜</a></p>
    <p>Como dijo el Principito: Lo esencial es invisible a los ojos... quizá con F12 veas al elefante 😏</p>


    <Link to="/">Volver al inicio</Link>
  </div>
);

export default NotFoundPage;