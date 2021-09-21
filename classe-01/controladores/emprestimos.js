const conexao = require('../conexao');

const listarEmprestimos = async (req, res) => {
    try {
        const { rows: emprestimos } = await conexao.query(`
        select 
        emprestimos.id as id,
        usuarios.nome as nome_usuario,
        usuarios.telefone as telefone_usuario,
        usuarios.email as email_usuario,
        livros.nome as nome_livro
        from emprestimos
        join usuarios on emprestimos.usuario_id = usuarios.id
        join livros on emprestimos.livro_id = livros.id
        `);

        return res.status(200).json(emprestimos);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const obterEmprestimo = async (req, res) => {
    const { id } = req.params;
    try {
        const emprestimo = await conexao.query(`
        select 
        emprestimos.id as id,
        usuarios.nome as nome_usuario,
        usuarios.telefone as telefone_usuario,
        usuarios.email as email_usuario,
        livros.nome as nome_livro
        from emprestimos
        join usuarios on emprestimos.usuario_id = usuarios.id
        join livros on emprestimos.livro_id = livros.id
        where emprestimos.id = $1`, [id]);

        if (emprestimo.rowCount === 0) {
            return res.status(404).json('Emprestimo não encontrado');
        }

        return res.status(200).json(emprestimo.rows[0]);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const cadastrarEmprestimo = async (req, res) => {
    const { usuario_id, livro_id } = req.body;

    if (!usuario_id || !livro_id) {
        return res.status(400).json("Os campos são obrigatórios.");
    }

    try {
        const query = 'insert into emprestimos (usuario_id, livro_id) values ($1, $2)';
        const emprestimo = await conexao.query(query, [usuario_id, livro_id]);

        if (emprestimo.rowCount === 0) {
            return res.status(400).json('Não foi possivel cadastrar o usuário');
        }

        return res.status(200).json('Emprestimo cadastrado com sucesso.')
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const atualizarEmprestimo = async (req, res) => {
    const { id } = req.params;

    try {
        const emprestimo = await conexao.query('select * from emprestimos where id = $1', [id]);
        const devolvido = 'devolvido';

        if (emprestimo.rowCount === 0) {
            return res.status(404).json('Emprestimo não encontrado');
        }

        const query = 'update emprestimos set status = $1 where id = $2';
        const emprestimoAtualizado = await conexao.query(query, [devolvido, id]);

        if (emprestimoAtualizado.rowCount === 0) {
            return res.status(404).json('Não foi possível atualizar o emprestimo');
        }

        return res.status(200).json('Livro Devolvido com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const excluirEmprestimo = async (req, res) => {
    const { id } = req.params;

    try {
        const emprestimo = await conexao.query('select * from emprestimos where id = $1', [id]);

        if (emprestimo.rowCount === 0) {
            return res.status(404).json('emprestimo não encontrado');
        }

        const query = 'delete from emprestimos where id = $1';
        const usuarioExcluido = await conexao.query(query, [id]);

        if (usuarioExcluido.rowCount === 0) {
            return res.status(404).json('Não foi possível excluir o emprestimo');
        }

        return res.status(200).json('emprestimo foi excluido com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {
    listarEmprestimos,
    obterEmprestimo,
    cadastrarEmprestimo,
    atualizarEmprestimo,
    excluirEmprestimo
};