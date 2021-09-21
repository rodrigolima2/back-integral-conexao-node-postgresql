const conexao = require('../conexao');

const listarUsuarios = async (req, res) => {
    try {
        const { rows: usuarios } = await conexao.query('select * from usuarios');

        for (const usuario of usuarios) {
            const { rows: emprestimos } = await conexao.query('select * from emprestimos where usuario_id = $1', [usuario.id]);
            usuario.emprestimos = emprestimos;
        }

        return res.status(200).json(usuarios);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const obterUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        const usuario = await conexao.query('select * from usuarios where id = $1', [id]);
        const { rows: emprestimos } = await conexao.query('select * from emprestimos where usuario_id = $1', [id]);

        usuario.rows[0].emprestimos = emprestimos;

        if (usuario.rowCount === 0) {
            return res.status(404).json('Usuário não encontrado');
        }

        return res.status(200).json(usuario.rows[0]);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const cadastrarUsuario = async (req, res) => {
    const { nome, idade, email, telefone, cpf } = req.body;

    if (!nome || !idade || !email || !cpf) {
        return res.status(400).json("Os campos são obrigatórios.");
    }

    try {
        const query = 'insert into usuarios (nome, idade, email, telefone, cpf) values ($1, $2, $3, $4, $5)';
        const usuario = await conexao.query(query, [nome, idade, email, telefone, cpf]);

        if (usuario.rowCount === 0) {
            return res.status(400).json('Não foi possivel cadastrar o usuário');
        }

        return res.status(200).json('Usuário cadastrado com sucesso.')
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const atualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nome, idade, email, telefone, cpf } = req.body;

    try {
        const usuario = await conexao.query('select * from usuarios where id = $1', [id]);

        if (usuario.rowCount === 0) {
            return res.status(404).json('Usuário não encontrado');
        }

        if (!nome || !idade || !email || !cpf) {
            return res.status(400).json("Os campos são obrigatórios.");
        }

        const query = 'update usuarios set nome = $1, idade = $2, email = $3, telefone = $4, cpf = $5 where id = $6';
        const usuarioAtualizado = await conexao.query(query, [nome, idade, email, telefone, cpf, id]);

        if (usuarioAtualizado.rowCount === 0) {
            return res.status(404).json('Não foi possível atualizar o usuário');
        }

        return res.status(200).json('Usuário foi atualizado com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const excluirUsuario = async (req, res) => {
    const { id } = req.params;

    try {
        const usuario = await conexao.query('select * from usuarios where id = $1', [id]);
        const emprestimos = await conexao.query('select * from emprestimos where usuario_id = $1', [id]);

        if (usuario.rowCount === 0) {
            return res.status(404).json('usuario não encontrado');
        }

        if (emprestimos.rowCount > 0) {
            return res.status(400).json('Existem emprestimos atrelados ao id do usuario.')
        }

        const query = 'delete from usuarios where id = $1';
        const usuarioExcluido = await conexao.query(query, [id]);

        if (usuarioExcluido.rowCount === 0) {
            return res.status(404).json('Não foi possível excluir o usuario');
        }

        return res.status(200).json('usuario foi excluido com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {
    listarUsuarios,
    obterUsuario,
    cadastrarUsuario,
    atualizarUsuario,
    excluirUsuario
};