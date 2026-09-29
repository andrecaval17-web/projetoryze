import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade — Ryze",
  description: "Como a Ryze coleta, usa e protege seus dados pessoais.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-heading-md font-semibold text-fg">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-body-md leading-relaxed text-fg-muted">{children}</div>
    </section>
  );
}

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
      <div className="rounded-lg border border-error/40 bg-error/10 p-4 text-body-sm text-error">
        ⚠️ RASCUNHO — revisar com advogado antes do lançamento público. Gerado como ponto de
        partida, não é aconselhamento jurídico.
      </div>

      <h1 className="mt-8 font-display text-display-md font-semibold text-fg">
        Política de Privacidade
      </h1>
      <p className="mt-2 text-body-sm text-fg-muted">Última atualização: 18 de julho de 2026.</p>

      <Section title="1. Introdução e controlador dos dados">
        <p>
          Esta Política de Privacidade explica como a Ryze Consultoria em Recursos Humanos
          (&quot;Ryze&quot;, &quot;nós&quot;), controladora dos dados pessoais tratados nesta
          Plataforma nos termos da Lei nº 13.709/2018 (LGPD), coleta, usa, armazena e protege
          seus dados pessoais ao usar nossos serviços. Esta política complementa os nossos{" "}
          <Link href="/termos" className="text-accent-600 underline underline-offset-2 dark:text-accent-400">
            Termos de Uso
          </Link>
          .
        </p>
        <p className="rounded-md bg-bg-surface-2 p-3 text-body-sm">
          [Razão social completa, CNPJ e endereço da Ryze a preencher antes da publicação.]
        </p>
      </Section>

      <Section title="2. Quais dados coletamos">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong className="text-fg">Dados de cadastro:</strong> nome, e-mail e senha
            (armazenada de forma criptografada, nunca em texto puro).
          </li>
          <li>
            <strong className="text-fg">Dados de perfil profissional:</strong> cargo-alvo,
            histórico de experiências, formação acadêmica, habilidades, idiomas, e-mail e
            telefone de contato, link do LinkedIn — informados por você para gerar seu currículo.
          </li>
          <li>
            <strong className="text-fg">Currículo gerado:</strong> as versões de currículo
            criadas ou adaptadas para vagas específicas, com o modelo visual escolhido.
          </li>
          <li>
            <strong className="text-fg">PDF do perfil do LinkedIn:</strong> quando você usa a
            Análise de LinkedIn, o arquivo enviado e o texto nele extraído são processados para
            gerar sugestões de melhoria.
          </li>
          <li>
            <strong className="text-fg">Transcrição da simulação de entrevista:</strong> o áudio
            da sua resposta é transcrito pelo navegador; o texto resultante e as perguntas da IA
            são salvos como histórico da sessão.
          </li>
          <li>
            <strong className="text-fg">Dados de pagamento:</strong> processados diretamente pelo
            nosso provedor de pagamentos (Stripe) — a Ryze não armazena números completos de
            cartão de crédito.
          </li>
          <li>
            <strong className="text-fg">Dados de uso:</strong> informações técnicas básicas de
            acesso à Plataforma (como logs de erro), usadas para manter o serviço funcionando.
          </li>
        </ul>
      </Section>

      <Section title="3. Finalidade do tratamento">
        <p>Usamos seus dados pessoais para:</p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Criar e manter sua conta e autenticar seu acesso;</li>
          <li>Gerar e adaptar seu currículo, analisar seu LinkedIn e conduzir a simulação de entrevista;</li>
          <li>Processar pagamentos e gerenciar sua assinatura;</li>
          <li>Agendar e conduzir sessões de mentoria (plano Mentoria);</li>
          <li>Enviar comunicações relacionadas ao serviço (vagas, confirmações, suporte);</li>
          <li>Cumprir obrigações legais e prevenir fraude.</li>
        </ul>
      </Section>

      <Section title="4. Base legal">
        <p>
          Tratamos seus dados principalmente com base na execução do contrato de prestação de
          serviço (art. 7º, V, LGPD) e, quando aplicável, no seu consentimento (art. 7º, I),
          coletado no cadastro e na contratação de planos pagos. Você pode revogar seu
          consentimento a qualquer momento, sem prejuízo do tratamento já realizado com base
          legal válida até então.
        </p>
      </Section>

      <Section title="5. Compartilhamento com terceiros e uso de IA">
        <p>
          Para prestar o serviço, compartilhamos dados pessoais estritamente necessários com os
          seguintes provedores, todos atuando como operadores nos termos da LGPD:
        </p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong className="text-fg">OpenAI (ou outro provedor de IA configurado):</strong>{" "}
            recebe os dados do seu perfil profissional, o texto extraído do PDF do LinkedIn e a
            transcrição da entrevista para gerar o currículo, a análise e as perguntas/parecer da
            simulação. Esses dados são enviados apenas no momento da geração, para processar sua
            solicitação.
          </li>
          <li>
            <strong className="text-fg">Supabase:</strong> hospeda o banco de dados e a
            autenticação da Plataforma.
          </li>
          <li>
            <strong className="text-fg">Stripe:</strong> processa pagamentos e gerencia
            assinaturas dos planos pagos.
          </li>
          <li>
            <strong className="text-fg">Cal.com:</strong> processa o agendamento das sessões de
            mentoria (plano Mentoria).
          </li>
        </ul>
        <p>
          Não vendemos seus dados pessoais a terceiros, nem os usamos para fins diferentes dos
          descritos nesta política sem seu consentimento.
        </p>
      </Section>

      <Section title="6. Transferência internacional de dados">
        <p>
          Alguns dos provedores listados acima podem processar dados em servidores localizados
          fora do Brasil. Nesses casos, buscamos garantir que o tratamento ocorra com
          salvaguardas adequadas, conforme exigido pela LGPD (art. 33).
        </p>
      </Section>

      <Section title="7. Tempo de retenção">
        <p>
          Mantemos seus dados pessoais enquanto sua conta estiver ativa e pelo tempo necessário
          para cumprir as finalidades descritas nesta política ou obrigações legais. Ao excluir
          sua conta, seus dados são removidos ou anonimizados, ressalvado o que a lei exigir que
          seja mantido (por exemplo, registros fiscais de pagamento).
        </p>
      </Section>

      <Section title="8. Seus direitos como titular dos dados">
        <p>Nos termos do art. 18 da LGPD, você tem direito a:</p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Confirmar a existência de tratamento e acessar seus dados;</li>
          <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
          <li>Solicitar a exclusão de dados tratados com base no seu consentimento;</li>
          <li>Solicitar a portabilidade dos seus dados a outro fornecedor;</li>
          <li>Revogar o consentimento a qualquer momento;</li>
          <li>Se opor a tratamentos realizados em desconformidade com a LGPD.</li>
        </ul>
        <p>
          Para exercer qualquer desses direitos, entre em contato pelo e-mail{" "}
          <a href="mailto:comercial@ryzerh.com.br" className="text-accent-600 underline underline-offset-2 dark:text-accent-400">
            comercial@ryzerh.com.br
          </a>
          . Responderemos dentro do prazo previsto em lei.
        </p>
      </Section>

      <Section title="9. Segurança da informação">
        <p>
          Adotamos medidas técnicas e organizacionais razoáveis para proteger seus dados contra
          acesso não autorizado, perda ou alteração indevida, incluindo senhas criptografadas e
          controle de acesso por autenticação. Nenhum sistema é 100% livre de risco, e nos
          comprometemos a comunicar incidentes relevantes conforme exigido pela LGPD.
        </p>
      </Section>

      <Section title="10. Cookies">
        <p>
          Utilizamos cookies essenciais para manter sua sessão autenticada na Plataforma. Não
          utilizamos cookies de rastreamento publicitário de terceiros no momento.
        </p>
      </Section>

      <Section title="11. Menores de idade">
        <p>
          A Plataforma é destinada a candidatos em busca de recolocação profissional, não sendo
          direcionada a menores de 18 anos.
        </p>
      </Section>

      <Section title="12. Alterações nesta política">
        <p>
          Podemos atualizar esta Política de Privacidade periodicamente. Alterações relevantes
          serão comunicadas por e-mail ou aviso na Plataforma antes de entrarem em vigor.
        </p>
      </Section>

      <Section title="13. Contato e encarregado de dados (DPO)">
        <p>
          Dúvidas, solicitações ou reclamações sobre o tratamento dos seus dados pessoais podem
          ser enviadas para{" "}
          <a href="mailto:comercial@ryzerh.com.br" className="text-accent-600 underline underline-offset-2 dark:text-accent-400">
            comercial@ryzerh.com.br
          </a>
          .
        </p>
        <p className="rounded-md bg-bg-surface-2 p-3 text-body-sm">
          [Nome e contato direto do Encarregado de Proteção de Dados (DPO) a definir antes da publicação.]
        </p>
      </Section>
    </div>
  );
}
