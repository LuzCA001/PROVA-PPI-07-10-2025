import getPool from '../BD/conexao.js';
export default class LivroController {

  // GET
  consultar(req, res) {
    const pool = getPool();
    
    if (req.params.id) {
      const { id } = req.params;
      pool.query('SELECT * FROM LIVROS WHERE liv_id = ?', [id])
        .then(([rows]) => {
          if (rows.length > 0) {
            res.status(200).json({ status: true, livros: rows });
          } else {
            res.status(404).json({ status: false, message: "Livro não encontrado!" });
          }
        })
        .catch(error => {
          res.status(500).json({ status: false, message: "Erro ao consultar livro: " + error.message });
        });
    } else {
      pool.query('SELECT * FROM LIVROS')
        .then(([rows]) => {
          res.status(200).json({ status: true, livros: rows });
        })
        .catch(error => {
          res.status(500).json({ status: false, message: "Erro ao consultar livros: " + error.message });
        });
    }
  }

  // POST
  gravar(req, res) {
    const { liv_titulo, liv_autor, cli_cpf } = req.body;

    if (liv_titulo && liv_autor && cli_cpf) {
      const pool = getPool();
      const query = 'INSERT INTO LIVROS (liv_titulo, liv_autor, cli_cpf) VALUES (?, ?, ?)';
      
      pool.query(query, [liv_titulo, liv_autor, cli_cpf])
        .then(() => {
          res.status(201).json({ status: true, message: "Livro cadastrado com sucesso!" });
        })
        .catch(error => {
          // Erro de chave estrangeira (cliente não existe)
          if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            res.status(400).json({ status: false, message: "Erro: CPF do cliente não encontrado." });
          } else {
            res.status(500).json({ status: false, message: "Erro ao cadastrar livro: " + error.message });
          }
        });
    } else {
      res.status(400).json({ status: false, message: "ERRO: Título, autor e CPF do cliente são obrigatórios." });
    }
  }

  // PUT
  atualizar(req, res) {
    const { id } = req.params;
    const { liv_titulo, liv_autor, cli_cpf } = req.body;

    if (liv_titulo && liv_autor && cli_cpf) {
      const pool = getPool();
      const query = 'UPDATE LIVROS SET liv_titulo = ?, liv_autor = ?, cli_cpf = ? WHERE liv_id = ?';
      
      pool.query(query, [liv_titulo, liv_autor, cli_cpf, id])
        .then(([result]) => {
          if (result.affectedRows > 0) {
            res.status(200).json({ status: true, message: "Livro atualizado com sucesso!" });
          } else {
            res.status(404).json({ status: false, message: "Livro não encontrado para atualização." });
          }
        })
        .catch(error => {
          res.status(500).json({ status: false, message: "Erro ao atualizar livro: " + error.message });
        });
    } else {
      res.status(400).json({ status: false, message: "ERRO: Título, autor e CPF do cliente são obrigatórios." });
    }
  }

  // DELETE
  excluir(req, res) {
    const { id } = req.params;

    if (id) {
      const pool = getPool();
      const query = 'DELETE FROM LIVROS WHERE liv_id = ?';
      
      pool.query(query, [id])
        .then(([result]) => {
          if (result.affectedRows > 0) {
            res.status(200).json({ status: true, message: "Livro excluído com sucesso!" });
          } else {
            res.status(404).json({ status: false, message: "Livro não encontrado para exclusão." });
          }
        })
        .catch(error => {
          res.status(500).json({ status: false, message: "Erro ao excluir livro: " + error.message });
        });
    } else {
      res.status(400).json({ status: false, message: "ERRO: O ID do livro deve ser informado na URL." });
    }
  }

  consultarPorCliente(req, res) {
    const { cpf } = req.params;

    if (!cpf) {
      return res.status(400).json({
        status: false,
        message: "ERRO: O CPF do cliente deve ser informado na URL."
      });
    }

    const pool = getPool();
    const query = 'SELECT * FROM LIVROS WHERE cli_cpf = ?';

    pool.query(query, [cpf])
      .then(([rows]) => {
        res.status(200).json({
          status: true,
          livros: rows
        });
      })
      .catch(error => {
        res.status(500).json({
          status: false,
          message: "Erro ao consultar os livros do cliente: " + error.message
        });
      });
  }
}