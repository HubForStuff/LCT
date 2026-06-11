export type ContactCopy = {
  title: string;
  intro: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  companyLabel: string;
  companyPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitLabel: string;
  sendingLabel: string;
  successTitle: string;
  successBody: string;
  errorBody: string;
  closeLabel: string;
  privacyNote: string;
  requiredError: string;
  emailError: string;
};

export const CONTACT_COPY: Record<"EN" | "BR" | "CN", ContactCopy> = {
  EN: {
    title: "Get in touch",
    intro: "Tell us about your goals and we'll route your request to the right advisor.",
    nameLabel: "Name",
    namePlaceholder: "Your full name",
    emailLabel: "Email",
    emailPlaceholder: "you@company.com",
    companyLabel: "Company (optional)",
    companyPlaceholder: "Company or organization",
    messageLabel: "Message",
    messagePlaceholder: "How can we help?",
    submitLabel: "Send message",
    sendingLabel: "Sending…",
    successTitle: "Thank you",
    successBody: "Your message is on its way. We'll be in touch shortly.",
    errorBody: "Something went wrong. Please try again or email us directly.",
    closeLabel: "Close",
    privacyNote: "We'll only use your details to respond to your request.",
    requiredError: "Please fill in your name, email, and message.",
    emailError: "Please enter a valid email address.",
  },
  BR: {
    title: "Fale com a gente",
    intro: "Conte seus objetivos e encaminharemos sua solicitação ao advisor certo.",
    nameLabel: "Nome",
    namePlaceholder: "Seu nome completo",
    emailLabel: "E-mail",
    emailPlaceholder: "voce@empresa.com",
    companyLabel: "Empresa (opcional)",
    companyPlaceholder: "Empresa ou organização",
    messageLabel: "Mensagem",
    messagePlaceholder: "Como podemos ajudar?",
    submitLabel: "Enviar mensagem",
    sendingLabel: "Enviando…",
    successTitle: "Obrigado",
    successBody: "Sua mensagem está a caminho. Entraremos em contato em breve.",
    errorBody: "Algo deu errado. Tente novamente ou envie um e-mail diretamente.",
    closeLabel: "Fechar",
    privacyNote: "Usaremos seus dados apenas para responder à sua solicitação.",
    requiredError: "Preencha nome, e-mail e mensagem.",
    emailError: "Informe um e-mail válido.",
  },
  CN: {
    title: "联系我们",
    intro: "告诉我们您的目标，我们会将您的请求转交给合适的顾问。",
    nameLabel: "姓名",
    namePlaceholder: "您的全名",
    emailLabel: "邮箱",
    emailPlaceholder: "you@company.com",
    companyLabel: "公司（选填）",
    companyPlaceholder: "公司或机构",
    messageLabel: "留言",
    messagePlaceholder: "我们能帮您什么？",
    submitLabel: "发送",
    sendingLabel: "发送中…",
    successTitle: "谢谢",
    successBody: "您的消息已发送，我们会尽快与您联系。",
    errorBody: "出了点问题，请重试或直接发邮件给我们。",
    closeLabel: "关闭",
    privacyNote: "我们仅会使用您的信息来回复您的请求。",
    requiredError: "请填写姓名、邮箱和留言。",
    emailError: "请输入有效的邮箱地址。",
  },
};
