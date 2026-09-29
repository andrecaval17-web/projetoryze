import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso — Ryze",
  description: "Termos de uso da plataforma Ryze.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-heading-md font-semibold text-fg">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-body-md leading-relaxed text-fg-muted">{children}</div>
    </section>
  );
}

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
      <h1 className="font-display text-display-md font-semibold text-fg">Termos de Uso</h1>
      <p className="mt-2 text-body-sm text-fg-muted">Última atualização: 18 de julho de 2026.</p>

      <Section title="1. Aceitação dos termos">
        <p>
          Estes Termos de Uso regulam o acesso e uso da plataforma Ryze (&quot;Plataforma&quot;,
          &quot;Serviço&quot;), operada pela Ryze Consultoria em Recursos Humanos
          (&quot;Ryze&quot;, &quot;nós&quot;). Ao criar uma conta ou usar qualquer funcionalidade
          da Plataforma, você (&quot;usuário&quot;, &quot;candidato&quot;) concorda
          integralmente com estes Termos e com a nossa{" "}
          <Link href="/privacidade" className="text-accent-600 underline underline-offset-2 dark:text-accent-400">
            Política de Privacidade
          </Link>
          . Se você não concorda, não utilize a Plataforma.
        </p>
      </Section>

      <Section title="2. Descrição do serviço">
        <p>
          A Ryze oferece ferramentas voltadas a candidatos em busca de recolocação profissional,
          incluindo: montagem de currículo com auxílio de inteligência artificial, análise de
          perfil do LinkedIn, simulação de entrevistas de emprego por voz com IA, acesso a um
          grupo de vagas via WhatsApp e, no plano Mentoria, sessões periódicas com um consultor
          humano. As funcionalidades disponíveis variam conforme o plano contratado (Grátis,
          Impulso ou Mentoria), descritos em detalhe na página de planos.
        </p>
      </Section>

      <Section title="3. Cadastro e conta do usuário">
        <p>
          Para usar a Plataforma, você deve criar uma conta com nome, e-mail e senha válidos.
          Você é responsável por manter a confidencialidade da sua senha e por todas as
          atividades realizadas na sua conta. Você se compromete a fornecer informações
          verdadeiras, atuais e completas no cadastro e no preenchimento do seu perfil
          profissional.
        </p>
      </Section>

      <Section title="4. Planos, pagamento e cancelamento">
        <p>
          O plano Grátis não exige pagamento. Os planos Impulso e Mentoria são assinaturas
          mensais recorrentes, processadas por um provedor de pagamentos terceirizado (Stripe).
          Você pode cancelar sua assinatura a qualquer momento, sem multa ou fidelidade — o
          cancelamento produz efeito ao final do período já pago. A Ryze não armazena dados
          completos de cartão de crédito; esses dados são processados diretamente pelo provedor
          de pagamentos.
        </p>
      </Section>

      <Section title="5. Uso de inteligência artificial e limitações">
        <p>
          Parte das funcionalidades (montagem/adaptação de currículo, análise de LinkedIn,
          simulação de entrevista) utiliza modelos de inteligência artificial de provedores
          terceiros para gerar conteúdo a partir dos dados que você fornece. Esse conteúdo é
          gerado automaticamente e pode conter imprecisões — é responsabilidade do usuário
          revisar e validar qualquer currículo, análise ou orientação antes de utilizá-la. A
          Ryze não garante resultados específicos (como ser chamado para entrevistas ou
          contratado) a partir do uso da Plataforma.
        </p>
      </Section>

      <Section title="6. Uso aceitável">
        <p>Ao usar a Plataforma, você concorda em não:</p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Fornecer informações falsas sobre sua identidade ou experiência profissional;</li>
          <li>Utilizar a Plataforma para fins ilícitos ou que violem direitos de terceiros;</li>
          <li>Tentar acessar dados de outros usuários ou contornar mecanismos de segurança;</li>
          <li>Fazer engenharia reversa, copiar ou redistribuir a Plataforma ou seu conteúdo.</li>
        </ul>
      </Section>

      <Section title="7. Propriedade intelectual">
        <p>
          A marca Ryze, o design, o código e os materiais da Plataforma são de propriedade da
          Ryze ou de seus licenciantes. O conteúdo que você envia (dados de perfil, currículo,
          PDF do LinkedIn) permanece de sua titularidade — você concede à Ryze uma licença
          limitada para processar esse conteúdo unicamente para prestar o serviço contratado.
        </p>
      </Section>

      <Section title="8. Limitação de responsabilidade">
        <p>
          A Plataforma é fornecida &quot;como está&quot;. Na máxima extensão permitida pela lei,
          a Ryze não se responsabiliza por decisões de contratação de terceiros, indisponibilidade
          temporária do serviço, ou danos indiretos decorrentes do uso da Plataforma.
        </p>
      </Section>

      <Section title="9. Cancelamento e encerramento de conta">
        <p>
          Você pode encerrar sua conta a qualquer momento entrando em contato conosco. A Ryze
          pode suspender ou encerrar contas que violem estes Termos, mediante aviso prévio quando
          possível.
        </p>
      </Section>

      <Section title="10. Alterações nestes Termos">
        <p>
          Podemos atualizar estes Termos periodicamente. Mudanças relevantes serão comunicadas
          por e-mail ou aviso na Plataforma. O uso continuado após a atualização implica
          concordância com os novos Termos.
        </p>
      </Section>

      <Section title="11. Legislação aplicável">
        <p>
          Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o
          foro do domicílio do usuário para dirimir eventuais controvérsias, quando aplicável
          pela legislação consumerista.
        </p>
      </Section>

      <Section title="12. Banco de Talentos">
        <p>
          Ao criar uma conta na Plataforma — gratuita ou paga — ou ao se candidatar a uma vaga
          divulgada pela Ryze, você passa a integrar o nosso banco de talentos. Isso significa que
          seus dados de contato e perfil profissional (nome, e-mail, telefone, cargo desejado,
          habilidades, resumo profissional e currículo, quando enviado) ficam disponíveis
          internamente para que a equipe da Ryze possa considerá-lo(a) para vagas futuras, sejam
          elas da própria Ryze ou de empresas clientes. A inclusão no banco de talentos é parte
          integrante do serviço e não exige um consentimento separado — ela ocorre
          automaticamente a partir do cadastro ou da candidatura, conforme o caso.
        </p>
      </Section>

      <Section title="13. Contato">
        <p>
          Dúvidas sobre estes Termos podem ser enviadas para{" "}
          <a href="mailto:comercial@ryzerh.com.br" className="text-accent-600 underline underline-offset-2 dark:text-accent-400">
            comercial@ryzerh.com.br
          </a>
          .
        </p>
      </Section>
    </div>
  );
}
