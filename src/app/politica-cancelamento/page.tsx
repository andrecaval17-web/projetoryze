import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Cancelamento e Reembolso — Ryze",
  description: "Regras de cobrança, cancelamento e reembolso das assinaturas Ryze.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-heading-md font-semibold text-fg">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-body-md leading-relaxed text-fg-muted">{children}</div>
    </section>
  );
}

export default function PoliticaCancelamentoPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
      <div className="rounded-lg border border-error/40 bg-error/10 p-4 text-body-sm text-error">
        ⚠️ RASCUNHO — revisar com advogado antes do lançamento público. Gerado como ponto de
        partida, não é aconselhamento jurídico.
      </div>

      <h1 className="mt-8 font-display text-display-md font-semibold text-fg">
        Política de Cancelamento e Reembolso
      </h1>
      <p className="mt-2 text-body-sm text-fg-muted">Última atualização: 02 de agosto de 2026.</p>

      <p className="mt-6 text-body-md leading-relaxed text-fg-muted">
        Aplicável às assinaturas dos planos Impulso e Mentoria da plataforma Ryze, nas
        modalidades mensal e anual. Esta política complementa os nossos{" "}
        <Link href="/termos" className="text-accent-600 underline underline-offset-2 dark:text-accent-400">
          Termos de Uso
        </Link>
        .
      </p>

      <Section title="1. Cobrança recorrente">
        <p>
          Os planos Impulso e Mentoria são contratados por assinatura, com cobrança recorrente
          mensal ou anual, conforme a opção escolhida no momento da contratação.
        </p>
        <p>
          O valor e a periodicidade da cobrança são sempre informados de forma clara antes da
          confirmação do pagamento.
        </p>
      </Section>

      <Section title="2. Cancelamento">
        <p>
          Você pode cancelar sua assinatura a qualquer momento, diretamente pela sua área de
          gerenciamento de assinatura na plataforma.
        </p>
        <p>
          O cancelamento interrompe a renovação automática do plano. O acesso às funcionalidades
          contratadas permanece disponível até o final do período já pago — não há interrupção
          imediata nem cobrança adicional após o cancelamento.
        </p>
      </Section>

      <Section title="3. Direito de arrependimento (7 dias)">
        <p>
          Nos termos do art. 49 do Código de Defesa do Consumidor, você tem o direito de desistir
          da contratação em até 7 (sete) dias corridos a partir da data da assinatura, com
          direito ao reembolso dos valores pagos, sem necessidade de justificativa.
        </p>
        <p>
          Para exercer esse direito, basta entrar em contato através dos canais de atendimento da
          Ryze dentro desse prazo.
        </p>
      </Section>

      <Section title="4. Início imediato do serviço">
        <p>
          Ao contratar um plano pago, você pode optar por iniciar o uso das ferramentas
          imediatamente, sem aguardar o fim do prazo de 7 dias mencionado no item 3.
        </p>
        <p>
          Nesse caso, você declara estar ciente de que, caso exerça o direito de arrependimento
          dentro do prazo legal, o valor do reembolso poderá considerar, de forma proporcional, os
          serviços já efetivamente utilizados até o momento da solicitação — como currículos
          gerados com IA, análises de LinkedIn realizadas e simulações de entrevista concluídas.
        </p>
        <p>
          Essa opção é sempre uma escolha sua, apresentada de forma clara no momento da
          contratação, e não afeta seu direito de arrependimento em si — apenas pode influenciar
          o valor final do reembolso proporcional ao uso já realizado.
        </p>
      </Section>

      <Section title="5. Registro de uso">
        <p>
          A plataforma mantém um histórico das ferramentas utilizadas em sua conta (currículos
          gerados, análises realizadas, simulações concluídas, entre outras), que pode ser
          consultado para fins de cálculo de reembolso proporcional, quando aplicável.
        </p>
      </Section>

      <Section title="6. Após o prazo de 7 dias">
        <p>
          Passado o prazo do direito de arrependimento, o cancelamento impede apenas a renovação
          futura da assinatura. Não há reembolso do período em curso, já que o acesso permanece
          disponível integralmente até o fim desse ciclo já pago.
        </p>
      </Section>

      <Section title="7. Cobranças indevidas ou erros técnicos">
        <p>
          Casos de cobrança duplicada, erro de faturamento, ou indisponibilidade comprovada da
          plataforma que impeça o uso do serviço contratado são tratados separadamente das regras
          acima, com reembolso garantido independentemente do prazo.
        </p>
      </Section>

      <Section title="8. Como cancelar ou solicitar reembolso">
        <p>
          Você pode gerenciar sua assinatura (incluindo cancelamento e histórico de cobranças) a
          qualquer momento pela sua área na plataforma, ou entrar em contato com nosso atendimento
          pelo e-mail{" "}
          <a href="mailto:comercial@ryzerh.com.br" className="text-accent-600 underline underline-offset-2 dark:text-accent-400">
            comercial@ryzerh.com.br
          </a>{" "}
          para qualquer solicitação relacionada a esta política.
        </p>
      </Section>
    </div>
  );
}
