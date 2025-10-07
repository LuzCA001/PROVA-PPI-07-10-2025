import getPool from '../BD/conexao.js';

export default class LivroController {

  
  consultar(req, res) {
    const pool = getPool();
    const status = req.query.status;
    
    let query = 'SELECT * FROM LIVROS';

    if (status === 'disponivel') {
      query = 'SELECT * FROM LIVROS WHERE cli_cpf IS NULL';
    } else if (status === 'associado') {
      query = 'SELECT * FROM LIVROS WHERE cli_cpf IS NOT NULL';
    }
    
    if (req.params.id) {
      const { id } = req.params;
      query = 'SELECT * FROM LIVROS WHERE liv_id = ?';
      pool.query(query, [id])
        .then(([rows]) => {
          
          if (rows.length > 0) {
            res.status(200).json({ status: true, livros: rows });
          } else {
            res.status(404).json({ status: false, message: "Livro não encontrado!" });
          }
        })
        .catch(error => { /*tratamento de erro*/ });
    } else {
     
      pool.query(query)
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
    const { liv_titulo, liv_autor } = req.body; 

    if (liv_titulo && liv_autor) {
      const pool = getPool();
      
      const query = 'INSERT INTO LIVROS (liv_titulo, liv_autor) VALUES (?, ?)';
      
      pool.query(query, [liv_titulo, liv_autor])
        .then(() => {
          res.status(201).json({ status: true, message: "Livro cadastrado com sucesso (disponível)!" });
        })
        .catch(error => {
          res.status(500).json({ status: false, message: "Erro ao cadastrar livro: " + error.message });
        });
    } else {
      res.status(400).json({ status: false, message: "ERRO: Título e autor são obrigatórios." });
    }
  }

  // PUT
  atualizar(req, res) {
    const { id } = req.params;
    const { liv_titulo, liv_autor, cli_cpf } = req.body;

    
    if (!id) {
        return res.status(400).json({ status: false, message: "ERRO: ID do livro é obrigatório." });
    }

    const pool = getPool();
    
    const query = 'UPDATE LIVROS SET liv_titulo = ?, liv_autor = ?, cli_cpf = ? WHERE liv_id = ?';
    
  
    pool.query('SELECT * FROM LIVROS WHERE liv_id = ?', [id])
      .then(([rows]) => {
        if (rows.length === 0) {
          return res.status(404).json({ status: false, message: "Livro não encontrado." });
        }
        
        const livroAtual = rows[0];
        
        
        const novoTitulo = liv_titulo !== undefined ? liv_titulo : livroAtual.liv_titulo;
        const novoAutor = liv_autor !== undefined ? liv_autor : livroAtual.liv_autor;
        const novoCpf = cli_cpf !== undefined ? cli_cpf : livroAtual.cli_cpf;

        return pool.query(query, [novoTitulo, novoAutor, novoCpf, id]);
      })
      .then(() => {
        res.status(200).json({ status: true, message: "Livro atualizado com sucesso!" });
      })
      .catch(error => {
        
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ status: false, message: "Erro: CPF do cliente não encontrado para associação." });
        }
        res.status(500).json({ status: false, message: "Erro ao atualizar livro: " + error.message });
      });
  }

  // DELETE
  excluir(req, res) {
  
    const { id } = req.params;
    if (id) {
        const pool = getPool();
        pool.query('DELETE FROM LIVROS WHERE liv_id = ?', [id])
            .then(([result]) => {
                if (result.affectedRows > 0) {
                    res.status(200).json({ status: true, message: "Livro excluído com sucesso!" });
                } else {
                    res.status(404).json({ status: false, message: "Livro não encontrado." });
                }
            })
            .catch(error => {
                res.status(500).json({ status: false, message: "Erro ao excluir: " + error.message });
            });
    } else {
        res.status(400).json({ status: false, message: "ID do livro é obrigatório." });
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