import { Router } from 'express';
import ClienteController from '../Controllers/clienteController.js';
import LivroController from '../Controllers/livroController.js';

const clienteRouter = Router();
const clienteController = new ClienteController();
const livroController = new LivroController();

clienteRouter.get('/', clienteController.consultar)
.get('/:cpf', clienteController.consultar)
.post('/', clienteController.gravar)
.put('/:cpf', clienteController.atualizar)
.delete('/:cpf', clienteController.excluir);

clienteRouter.get('/:cpf/livros', livroController.consultarPorCliente);

export default clienteRouter;