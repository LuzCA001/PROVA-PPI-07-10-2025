import { Router } from 'express';
import LivroController from '../Controllers/livroController.js';

const livroRouter = Router();
const livroController = new LivroController();

livroRouter.get('/', livroController.consultar)
.get('/:id', livroController.consultar)
.post('/', livroController.gravar)
.put('/:id', livroController.atualizar)
.delete('/:id', livroController.excluir);

export default livroRouter;