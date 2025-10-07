import getPool from '../BD/conexao.js';

export default class ClienteController {

  // GET
  consultar(req, res) {
    const pool = getPool();
    if (req.params.cpf) {
      const { cpf } = req.params;
      pool.query('SELECT * FROM CLIENTES WHERE cli_cpf = ?', [cpf])
        .then(([linhas]) => {
          if (linhas.length > 0) {
            res.status(200).json({ status: true, clientes: linhas });
          } else {
            res.status(404).json({ status: false, message: "Cliente não encontrado!" });
          }
        })
        .catch(error => {
          res.status(500).json({ status: false, message: "Erro ao consultar cliente: " + error.message });
        });
    } else {
      pool.query('SELECT * FROM CLIENTES')
        .then(([linhas]) => {
          res.status(200).json({ status: true, clientes: linhas });
        })
        .catch(error => {
          res.status(500).json({ status: false, message: "Erro ao consultar clientes: " + error.message });
        });
    }
  }

  async consultarComLivros(req, res) {
    const pool = getPool();
    const { cpf } = req.params;

    try {
        
        const [clienteRows] = await pool.query('SELECT * FROM CLIENTES WHERE cli_cpf = ?', [cpf]);
        if (clienteRows.length === 0) {
            return res.status(404).json({ status: false, message: "Cliente não encontrado!" });
        }
        const cliente = clienteRows[0];

     
        const [livroRows] = await pool.query('SELECT * FROM LIVROS WHERE cli_cpf = ?', [cpf]);
        
       
        cliente.livros = livroRows;
        res.status(200).json({ status: true, clientes: [cliente] });

    } catch (error) {
        res.status(500).json({ status: false, message: "Erro ao consultar cliente e livros: " + error.message });
    }
}

  // POST
  async gravar(req, res) {
    const { cli_cpf, cli_nome, cli_telefone, cli_email, liv_ids } = req.body;

    if (!cli_cpf || !cli_nome || !cli_email) {
        return res.status(400).json({
            status: false,
            message: "ERRO: Os campos CPF, nome e email são obrigatórios."
        });
    }

    const pool = getPool();
    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const queryCliente = 'INSERT INTO CLIENTES (cli_cpf, cli_nome, cli_telefone, cli_email) VALUES (?, ?, ?, ?)';
        await connection.query(queryCliente, [cli_cpf, cli_nome, cli_telefone, cli_email]);

        if (liv_ids && liv_ids.length > 0) {
            const queryLivro = 'UPDATE LIVROS SET cli_cpf = ? WHERE liv_id = ? AND cli_cpf IS NULL';
            for (const livroId of liv_ids) {
                await connection.query(queryLivro, [cli_cpf, livroId]);
            }
        }
        
        await connection.commit();
        res.status(201).json({ status: true, message: "Cliente e livros associados com sucesso!" });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        
        if (error.code === 'ER_DUP_ENTRY') {
            let errorMessage = "Erro de duplicação. Verifique os dados.";
            if (error.sqlMessage.includes("cli_cpf")) {
                errorMessage = "Este CPF já está cadastrado.";
            } else if (error.sqlMessage.includes("cli_telefone")) {
                errorMessage = "Este Telefone já está cadastrado.";
            } else if (error.sqlMessage.includes("cli_email")) {
                errorMessage = "Este E-mail já está cadastrado.";
            }
            return res.status(409).json({ status: false, message: errorMessage });
        }

        res.status(500).json({ status: false, message: "Erro ao cadastrar: " + error.message });

    } finally {
        if (connection) {
            connection.release();
        }
    }
}

  // PUT
  async atualizar(req, res) {
    const { cpf } = req.params;
    const { cli_nome, cli_telefone, cli_email, liv_ids } = req.body;

    if (!cli_nome || !cli_email) {
        return res.status(400).json({ status: false, message: "Nome e email são obrigatórios." });
    }

    const pool = getPool();
    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const queryCliente = 'UPDATE CLIENTES SET cli_nome = ?, cli_telefone = ?, cli_email = ? WHERE cli_cpf = ?';
        const [result] = await connection.query(queryCliente, [cli_nome, cli_telefone, cli_email, cpf]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ status: false, message: "Cliente não encontrado para atualização." });
        }

        const desassociarQuery = 'UPDATE LIVROS SET cli_cpf = NULL WHERE cli_cpf = ?';
        await connection.query(desassociarQuery, [cpf]);

        if (liv_ids && liv_ids.length > 0) {
            const associarQuery = 'UPDATE LIVROS SET cli_cpf = ? WHERE liv_id = ?';
            for (const livroId of liv_ids) {
                await connection.query(associarQuery, [cpf, livroId]);
            }
        }

        await connection.commit();
        res.status(200).json({ status: true, message: "Cliente e livros atualizados com sucesso!" });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

      
        if (error.code === 'ER_DUP_ENTRY') {
            let errorMessage = "Erro de duplicação. Verifique os dados.";
            if (error.sqlMessage.includes("cli_telefone")) {
                errorMessage = "Este Telefone já pertence a outro cliente.";
            } else if (error.sqlMessage.includes("cli_email")) {
                errorMessage = "Este E-mail já pertence a outro cliente.";
            }
            return res.status(409).json({ status: false, message: errorMessage });
        }

        res.status(500).json({ status: false, message: "Erro ao atualizar: " + error.message });

    } finally {
        if (connection) {
            connection.release();
        }
    }
}

  // DELETE
  excluir(req, res) {
    const { cpf } = req.params;
    if (cpf) {
      const pool = getPool();
      pool.query('DELETE FROM CLIENTES WHERE cli_cpf = ?', [cpf])
        .then(([result]) => {

          if (result.affectedRows > 0) {
            res.status(200).json({ status: true, message: "Cliente excluído com sucesso!" });
          } else {
            res.status(404).json({ status: false, message: "Cliente não encontrado." });
          }
        })
        .catch(error => {
          res.status(500).json({ status: false, message: "Erro ao excluir: " + error.message });
        });
    } else {
      res.status(400).json({ status: false, message: "CPF é obrigatório." });
    }
  }
}