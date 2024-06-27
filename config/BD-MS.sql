USE bd0xccqaqlwuq4dfea1n;


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */
;

/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */
;

/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */
;

/*!40101 SET NAMES utf8mb4 */
;

--
-- Banco de dados: `u237370611_BDMaisSporte`
--
-- --------------------------------------------------------
--
-- Estrutura para tabela `avaliacao_local`
--
CREATE TABLE `avaliacao_local` (
    `id_avaliacao_local` int(11) NOT NULL,
    `fk_id_cliente` int(11) DEFAULT NULL,
    `fk_id_local` int(11) DEFAULT NULL,
    `comentario_prod` varchar(400) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- --------------------------------------------------------
--
-- Estrutura para tabela `avaliacao_prod`
--
CREATE TABLE `avaliacao_prod` (
    `id_avaliacao_prod` int(11) NOT NULL,
    `fk_id_cliente` int(11) DEFAULT NULL,
    `fk_id_emp` int(11) DEFAULT NULL,
    `fk_id_prod` int(11) DEFAULT NULL,
    `comentario_prod` varchar(400) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- --------------------------------------------------------
--
-- Estrutura para tabela `empresas`
--
CREATE TABLE `empresas` (
    `id_emp` int(11) NOT NULL,
    `cnpj_emp` char(14) DEFAULT NULL,
    `email_emp` varchar(30) NOT NULL,
    `senha_emp` varchar(24) NOT NULL,
    `celular_emp` char(11) DEFAULT NULL,
    `logradouro_emp` varchar(32) NOT NULL,
    `bairro_emp` varchar(32) NOT NULL,
    `cidade_emp` varchar(32) NOT NULL,
    `uf_emp` varchar(2) NOT NULL,
    `cep_emp` char(8) NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- --------------------------------------------------------
--
-- Estrutura para tabela `empresas_produtos`
--
CREATE TABLE `empresas_produtos` (
    `fk_id_emp` int(11) DEFAULT NULL,
    `fk_id_prod` int(11) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- --------------------------------------------------------
--
-- Estrutura para tabela `item_pedido`
--
CREATE TABLE `item_pedido` (
    `id_item_pedido` int(11) NOT NULL,
    `fk_id_emp` int(11) DEFAULT NULL,
    `fk_id_pedido` int(11) DEFAULT NULL,
    `fk_id_prod` int(11) DEFAULT NULL,
    `qntd_produto` int(11) DEFAULT NULL,
    `subtotal_produto` decimal(9, 2) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- --------------------------------------------------------
--
-- Estrutura para tabela `locais`
--
CREATE TABLE `locais` (
    `id_local` int(11) NOT NULL,
    `logradouro_local` varchar(32) NOT NULL,
    `bairro_local` varchar(32) NOT NULL,
    `cidade_local` varchar(32) NOT NULL,
    `uf_local` varchar(32) NOT NULL,
    `cep_local` char(8) NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- --------------------------------------------------------
--
-- Estrutura para tabela `pedidos`
--
CREATE TABLE `pedidos` (
    `id_pedido` int(11) NOT NULL,
    `fk_id_cliente` int(11) DEFAULT NULL,
    `data_pedido` char(8) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- --------------------------------------------------------
--
-- Estrutura para tabela `preco_prod`
--
CREATE TABLE `preco_prod` (
    `id_preco` int(11) NOT NULL,
    `fk_id_prod` int(11) DEFAULT NULL,
    `valor_prod` decimal(9, 2) NOT NULL,
    `ini_vig` date DEFAULT NULL,
    `fim_vig` date DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `preco_prod`
--


INSERT INTO
    `preco_prod` (
        `id_preco`,
        `fk_id_prod`,
        `valor_prod`,
        `ini_vig`,
        `fim_vig`
    )
VALUES
    (1, 2, 179.00, '2024-01-17', NULL);

--
-- Acionadores `preco_prod`
--
DELIMITER $

CREATE TRIGGER update_preco_prod BEFORE INSERT ON preco_prod
FOR EACH ROW
BEGIN
    DECLARE last_id_preco INT;
    DECLARE variavel_fim_vig DATE;

    -- Verifica se já existe uma chave estrangeira com o mesmo número
    SELECT id_preco INTO last_id_preco FROM preco_prod WHERE fk_id_prod = NEW.fk_id_prod ORDER BY id_preco DESC LIMIT 1;

    -- Se existir, atualiza o fim da vigência do registro anterior
    IF last_id_preco IS NOT NULL THEN
        SET variavel_fim_vig = NEW.ini_vig;

        -- Define o fim_vig do registro anterior antes de inserir o novo
        UPDATE preco_prod SET fim_vig = variavel_fim_vig WHERE id_preco = last_id_preco;
    END IF;
END$
DELIMITER ;


-- --------------------------------------------------------
--
-- Estrutura para tabela `produtos_das_empresas`
--
CREATE TABLE `produtos_das_empresas` (
    `id_prod` int(11) NOT NULL,
    `titulo_prod` varchar(45) NOT NULL,
    `descricao_prod` varchar(400) DEFAULT NULL,
    `qntd_estoque_prod` int(11) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `produtos_das_empresas`
--
INSERT INTO
    `produtos_das_empresas` (
        `id_prod`,
        `titulo_prod`,
        `descricao_prod`,
        `qntd_estoque_prod`
    )
VALUES
    (2, 'mouse', 'mouse hyperx', 27);

-- --------------------------------------------------------
--
-- Estrutura para tabela `usuario_clientes`
--
CREATE TABLE `usuario_clientes` (
    `nome_cliente` varchar(36) NOT NULL,
    `id_cliente` PRIMARY KEY varchar(12) NOT NULL AUTO_INCREMENT,
    `email_cliente` varchar(30) NOT NULL,
    `senha_cliente` varchar(24) NOT NULL,
    `celular_cliente` char(11) DEFAULT NULL,
    `logradouro_cliente` varchar(32) NULL,
    `bairro_cliente` varchar(32) NULL,
    `cidade_cliente` varchar(32) NULL,
    `cep_cliente` char(8) NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `usuario_clientes`
--
INSERT INTO
    `usuario_clientes` (
        `id_cliente`,
        `email_cliente`,
        `senha_cliente`,
        `celular_cliente`,
        `logradouro_cliente`,
        `bairro_cliente`,
        `cidade_cliente`,
        `cep_cliente`
    )
VALUES
    (
        1,
        'ruhan.vila11@gmail.com',
        '123456789',
        '11988501820',
        'estrada tambory',
        'vila cretti',
        'carapicuiba',
        '00000000'
    ),
    (
        2,
        'lucasogomes011@gmail.com',
        'hohisdildfd',
        '11988501820',
        'estrada tambory',
        'vila cretti',
        'carapicuiba',
        '00000000'
    ),
    (
        3,
        'matheus_morais06@yahoo.com.br',
        '70077',
        '11995075977',
        'Rua bonnard 222',
        'Alphaville',
        'barueri',
        '06465134'
    );

--
-- Índices para tabelas despejadas
--
--
-- Índices de tabela `avaliacao_local`
--
ALTER TABLE
    `avaliacao_local`
ADD
    PRIMARY KEY (`id_avaliacao_local`),
ADD
    KEY `fk_id_cliente` (`fk_id_cliente`),
ADD
    KEY `fk_id_local` (`fk_id_local`);

--
-- Índices de tabela `avaliacao_prod`
--
ALTER TABLE
    `avaliacao_prod`
ADD
    PRIMARY KEY (`id_avaliacao_prod`),
ADD
    KEY `fk_id_cliente` (`fk_id_cliente`),
ADD
    KEY `fk_id_emp` (`fk_id_emp`),
ADD
    KEY `fk_id_prod` (`fk_id_prod`);

--
-- Índices de tabela `empresas`
--
ALTER TABLE
    `empresas`
ADD
    PRIMARY KEY (`id_emp`);

--
-- Índices de tabela `empresas_produtos`
--
ALTER TABLE
    `empresas_produtos`
ADD
    KEY `fk_id_emp` (`fk_id_emp`),
ADD
    KEY `fk_id_prod` (`fk_id_prod`);

--
-- Índices de tabela `item_pedido`
--
ALTER TABLE
    `item_pedido`
ADD
    PRIMARY KEY (`id_item_pedido`),
ADD
    KEY `fk_id_pedido` (`fk_id_pedido`),
ADD
    KEY `fk_id_prod` (`fk_id_prod`),
ADD
    KEY `fk_id_emp` (`fk_id_emp`);

--
-- Índices de tabela `locais`
--
ALTER TABLE
    `locais`
ADD
    PRIMARY KEY (`id_local`);

--
-- Índices de tabela `pedidos`
--
ALTER TABLE
    `pedidos`
ADD
    PRIMARY KEY (`id_pedido`),
ADD
    KEY `fk_id_cliente` (`fk_id_cliente`);

--
-- Índices de tabela `preco_prod`
--
ALTER TABLE
    `preco_prod`
ADD
    PRIMARY KEY (`id_preco`),
ADD
    KEY `fk_id_prod` (`fk_id_prod`);

--
-- Índices de tabela `produtos_das_empresas`
--
ALTER TABLE
    `produtos_das_empresas`
ADD
    PRIMARY KEY (`id_prod`);

--
-- Índices de tabela `usuario_clientes`
--
ALTER TABLE
    `usuario_clientes`
ADD
    PRIMARY KEY (`id_cliente`);

--
-- AUTO_INCREMENT para tabelas despejadas
--
--
-- AUTO_INCREMENT de tabela `avaliacao_local`
--
ALTER TABLE
    `avaliacao_local`
MODIFY
    `id_avaliacao_local` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `avaliacao_prod`
--
ALTER TABLE
    `avaliacao_prod`
MODIFY
    `id_avaliacao_prod` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `empresas`
--
ALTER TABLE
    `empresas`
MODIFY
    `id_emp` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `item_pedido`
--
ALTER TABLE
    `item_pedido`
MODIFY
    `id_item_pedido` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `locais`
--
ALTER TABLE
    `locais`
MODIFY
    `id_local` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `pedidos`
--
ALTER TABLE
    `pedidos`
MODIFY
    `id_pedido` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `preco_prod`
--
ALTER TABLE
    `preco_prod`
MODIFY
    `id_preco` int(11) NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 10;

--
-- AUTO_INCREMENT de tabela `produtos_das_empresas`
--
ALTER TABLE
    `produtos_das_empresas`
MODIFY
    `id_prod` int(11) NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 3;

--
-- AUTO_INCREMENT de tabela `usuario_clientes`
--
ALTER TABLE
    `usuario_clientes`
MODIFY
    `id_cliente` int(11) NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 4;

--
-- Restrições para tabelas despejadas
--
--
-- Restrições para tabelas `avaliacao_local`
--
ALTER TABLE
    `avaliacao_local`
ADD
    CONSTRAINT `avaliacao_local_ibfk_1` FOREIGN KEY (`fk_id_cliente`) REFERENCES `usuario_clientes` (`id_cliente`),
ADD
    CONSTRAINT `avaliacao_local_ibfk_2` FOREIGN KEY (`fk_id_local`) REFERENCES `locais` (`id_local`);

--
-- Restrições para tabelas `avaliacao_prod`
--
ALTER TABLE
    `avaliacao_prod`
ADD
    CONSTRAINT `avaliacao_prod_ibfk_1` FOREIGN KEY (`fk_id_cliente`) REFERENCES `usuario_clientes` (`id_cliente`),
ADD
    CONSTRAINT `avaliacao_prod_ibfk_2` FOREIGN KEY (`fk_id_emp`) REFERENCES `empresas` (`id_emp`),
ADD
    CONSTRAINT `avaliacao_prod_ibfk_3` FOREIGN KEY (`fk_id_prod`) REFERENCES `produtos_das_empresas` (`id_prod`);

--
-- Restrições para tabelas `empresas_produtos`
--
ALTER TABLE
    `empresas_produtos`
ADD
    CONSTRAINT `empresas_produtos_ibfk_1` FOREIGN KEY (`fk_id_emp`) REFERENCES `empresas` (`id_emp`),
ADD
    CONSTRAINT `empresas_produtos_ibfk_2` FOREIGN KEY (`fk_id_prod`) REFERENCES `produtos_das_empresas` (`id_prod`);

--
-- Restrições para tabelas `item_pedido`
--
ALTER TABLE
    `item_pedido`
ADD
    CONSTRAINT `item_pedido_ibfk_1` FOREIGN KEY (`fk_id_pedido`) REFERENCES `pedidos` (`id_pedido`),
ADD
    CONSTRAINT `item_pedido_ibfk_2` FOREIGN KEY (`fk_id_prod`) REFERENCES `produtos_das_empresas` (`id_prod`),
ADD
    CONSTRAINT `item_pedido_ibfk_3` FOREIGN KEY (`fk_id_emp`) REFERENCES `empresas` (`id_emp`);

--
-- Restrições para tabelas `pedidos`
--
ALTER TABLE
    `pedidos`
ADD
    CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`fk_id_cliente`) REFERENCES `usuario_clientes` (`id_cliente`);

--
-- Restrições para tabelas `preco_prod`
--
ALTER TABLE
    `preco_prod`
ADD
    CONSTRAINT `preco_prod_ibfk_1` FOREIGN KEY (`fk_id_prod`) REFERENCES `produtos_das_empresas` (`id_prod`);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */
;

/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */
;

/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */
;