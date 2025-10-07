import getPool from '../BD/conexao.js';

export default class ClienteController {

  // GET
  consultar(req, res) {
    const pool = getPool();
    
    // Se um CPF foi passado na URL, consulta por ele
    if (req.params.cpf) {
      const { cpf } = req.params;
      pool.query('SELECT * FROM CLIENTES WHERE cli_cpf = ?', [cpf])
        .then(([rows]) => {
          if (rows.length > 0) {
            res.status(200).json({
              status: true,
              clientes: rows
            });
          } else {
            res.status(404).json({
              status: false,
              message: "Cliente não encontrado!"
            });
          }
        })
        .catch(error => {
          res.status(500).json({
            status: false,
            message: "Erro ao consultar cliente: " + error.message
          });
        });
    } else {
      // Se nenhum CPF foi passado, consulta todos
      pool.query('SELECT * FROM CLIENTES')
        .then(([rows]) => {
          res.status(200).json({
            status: true,
            clientes: rows
          });
        })
        .catch(error => {
          res.status(500).json({
            status: false,
            message: "Erro ao consultar clientes: " + error.message
          });
        });
    }
  }

  // POST
  gravar(req, res) {
    const { cli_cpf, cli_nome, cli_telefone, cli_email } = req.body;

    if (cli_cpf && cli_nome && cli_email) {
      const pool = getPool();
      const query = 'INSERT INTO CLIENTES (cli_cpf, cli_nome, cli_telefone, cli_email) VALUES (?, ?, ?, ?)';
      
      pool.query(query, [cli_cpf, cli_nome, cli_telefone, cli_email])
        .then(() => {
          res.status(201).json({
            status: true,
            message: "Cliente cadastrado com sucesso!"
          });
        })
        .catch(error => {
          if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({
              status: false,
              message: "Este CPF já está cadastrado."
            });
          } else {
            res.status(500).json({
              status: false,
              message: "Erro ao cadastrar cliente: " + error.message
            });
          }
        });
    } else {
      res.status(400).json({
        status: false,
        message: "ERRO: Os campos CPF, nome e email devem ser preenchidos."
      });
    }
  }

  // PUT
  atualizar(req, res) {
    const { cpf } = req.params;
    const { cli_nome, cli_telefone, cli_email } = req.body;

    if (cli_nome && cli_email) {
      const pool = getPool();
      const query = 'UPDATE CLIENTES SET cli_nome = ?, cli_telefone = ?, cli_email = ? WHERE cli_cpf = ?';
      
      pool.query(query, [cli_nome, cli_telefone, cli_email, cpf])
        .then(([result]) => {
          if (result.affectedRows > 0) {
            res.status(200).json({
              status: true,
              message: "Cliente atualizado com sucesso!"
            });
          } else {
            res.status(404).json({
              status: false,
              message: "Cliente não encontrado para atualização."
            });
          }
        })
        .catch(error => {
          res.status(500).json({
            status: false,
            message: "Erro ao atualizar cliente: " + error.message
          });
        });
    } else {
      res.status(400).json({
        status: false,
        message: "ERRO: Os campos nome e email devem ser preenchidos."
      });
    }
  }

  // DELETE
  excluir(req, res) {
    const { cpf } = req.params;

    if (cpf) {
      const pool = getPool();
      const query = 'DELETE FROM CLIENTES WHERE cli_cpf = ?';
      
      pool.query(query, [cpf])
        .then(([result]) => {
          if (result.affectedRows > 0) {
            res.status(200).json({
              status: true,
              message: "Cliente excluído com sucesso!"
            });
          } else {
            res.status(404).json({
              status: false,
              message: "Cliente não encontrado para exclusão."
            });
          }
        })
        .catch(error => {
          res.status(500).json({
            status: false,
            message: "Erro ao excluir cliente: " + error.message
          });
        });
    } else {
      res.status(400).json({
        status: false,
        message: "ERRO: O CPF do cliente deve ser informado na URL."
      });
    }
  }
}