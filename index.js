import express from 'express';
import cors from 'cors';
import clienteRouter from './Routes/clienteRoutes.js';
import livroRouter from './Routes/livroRoutes.js';


const app = express();
app.use(cors());
app.use(express.json());

app.use('/clientes', clienteRouter);
app.use('/livros', livroRouter);

app.get('/', (req, res) => {
  res.send('API da Livraria está funcionando!');
});

const port = 5000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta http://localhost:${port}`);
});