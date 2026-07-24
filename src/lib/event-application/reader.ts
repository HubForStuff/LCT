import { getHomepageData } from "../homepage/reader";
import { HOMEPAGE_LOCALE_CODES, type HomepageLocaleCode } from "../homepage/types";
import { INTERIOR_LOCALES } from "../interior-pages/locales";
import { getEventFormOptions } from "../events/reader";

import type { SiteSettings } from "../homepage/types";
import type { DesktopMenuSection } from "../homepage/types";
import type { EventFormOption, EventsPageContent } from "../events/types";
import type {
  InteriorFooterContent,
  InteriorNavItem,
  InteriorPageMeta,
  InteriorPageUi,
} from "../interior-pages/types";

export type EventApplicationPageCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  selectedEventLabel: string;
  sectionTitle: string;
  sectionSubtitle: string;
  fields: {
    event: string;
    eventPlaceholder: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    company: string;
    companyPlaceholder: string;
    message: string;
    messagePlaceholder: string;
  };
  submitLabel: string;
  submission: {
    submittingMessage: string;
    successMessage: string;
    errorMessage: string;
    validationMessage: string;
  };
};

export type EventApplicationRouteLocale = {
  meta: InteriorPageMeta;
  ui: InteriorPageUi;
  navItems: InteriorNavItem[];
  footer: InteriorFooterContent;
  desktopMenuSections: DesktopMenuSection[];
  navExploreLabel: string;
  page: EventApplicationPageCopy;
  eventOptions: EventFormOption[];
};

export type EventApplicationPageData = {
  siteSettings: SiteSettings;
  defaultLanguage: HomepageLocaleCode;
  defaultLocale: EventApplicationRouteLocale;
  localizedContent: Record<HomepageLocaleCode, EventApplicationRouteLocale>;
};

const EVENT_APPLICATION_COPY: Record<HomepageLocaleCode, EventApplicationPageCopy> = {
  EN: {
    eyebrow: "Event application",
    title: "Apply to attend",
    subtitle:
      "Tell us a little about yourself and we'll follow up with the details for this event.",
    selectedEventLabel: "Selected event",
    sectionTitle: "Your details",
    sectionSubtitle: "This takes about a minute — no documents required.",
    fields: {
      event: "Event",
      eventPlaceholder: "Select an event",
      name: "Name",
      namePlaceholder: "Your full name",
      email: "Email",
      emailPlaceholder: "you@company.com",
      company: "Company",
      companyPlaceholder: "Company name",
      message: "Short message",
      messagePlaceholder: "Briefly tell us about your company and why you're interested.",
    },
    submitLabel: "Apply to attend",
    submission: {
      submittingMessage: "Submitting...",
      successMessage: "Thanks — we've received your application and will be in touch.",
      errorMessage: "We could not submit the form. Please try again.",
      validationMessage: "Please complete the required fields.",
    },
  },
  BR: {
    eyebrow: "Inscricao no evento",
    title: "Inscreva-se para participar",
    subtitle:
      "Conte um pouco sobre voce e enviaremos os detalhes deste evento.",
    selectedEventLabel: "Evento selecionado",
    sectionTitle: "Seus dados",
    sectionSubtitle: "Leva cerca de um minuto — nenhum documento necessario.",
    fields: {
      event: "Evento",
      eventPlaceholder: "Selecione um evento",
      name: "Nome",
      namePlaceholder: "Seu nome completo",
      email: "Email",
      emailPlaceholder: "voce@empresa.com",
      company: "Empresa",
      companyPlaceholder: "Nome da empresa",
      message: "Mensagem breve",
      messagePlaceholder: "Conte brevemente sobre sua empresa e por que tem interesse.",
    },
    submitLabel: "Inscrever-se para participar",
    submission: {
      submittingMessage: "Enviando...",
      successMessage: "Obrigado — recebemos sua inscricao e entraremos em contato.",
      errorMessage: "Nao foi possivel enviar o formulario. Tente novamente.",
      validationMessage: "Preencha os campos obrigatorios.",
    },
  },
  CN: {
    eyebrow: "活动报名",
    title: "申请参加",
    subtitle: "简单介绍一下您自己，我们将向您发送该活动的详细信息。",
    selectedEventLabel: "已选活动",
    sectionTitle: "您的信息",
    sectionSubtitle: "大约需要一分钟——无需任何文件。",
    fields: {
      event: "活动",
      eventPlaceholder: "选择一个活动",
      name: "姓名",
      namePlaceholder: "您的全名",
      email: "邮箱",
      emailPlaceholder: "you@company.com",
      company: "公司",
      companyPlaceholder: "公司名称",
      message: "简短留言",
      messagePlaceholder: "简要介绍您的公司以及您感兴趣的原因。",
    },
    submitLabel: "申请参加",
    submission: {
      submittingMessage: "正在提交……",
      successMessage: "感谢——我们已收到您的申请，会尽快与您联系。",
      errorMessage: "无法提交表单，请重试。",
      validationMessage: "请填写必填字段。",
    },
  },
};

const META_BY_CODE: Record<HomepageLocaleCode, Omit<InteriorPageMeta, "htmlLang">> = {
  EN: {
    title: "Apply to Attend | LATAM China Tech",
    description: "Apply to attend a LATAM China Tech event.",
  },
  BR: {
    title: "Inscricao no Evento | LATAM China Tech",
    description: "Inscreva-se para participar de um evento da LATAM China Tech.",
  },
  CN: {
    title: "申请参加活动 | LATAM China Tech",
    description: "申请参加 LATAM China Tech 举办的活动。",
  },
};

export async function getEventApplicationPageData(): Promise<EventApplicationPageData> {
  const [homepageData, eventOptionsByLocale] = await Promise.all([
    getHomepageData(),
    getEventFormOptions(),
  ]);

  const localizedContent = Object.fromEntries(
    HOMEPAGE_LOCALE_CODES.map((code) => {
      const interior = INTERIOR_LOCALES[code];
      const homepageLocale = homepageData.localizedContent[code];
      // Cast for the same reason src/lib/events/reader.ts does: the shared
      // InteriorPageLocaleContent type doesn't declare the events-specific keys (known-noise
      // LSP diagnostic "Property 'eventsPage' does not exist").
      const eventsMeta = (interior.eventsPage as unknown as EventsPageContent).meta;

      const routeLocale: EventApplicationRouteLocale = {
        meta: {
          htmlLang: eventsMeta.htmlLang,
          title: META_BY_CODE[code].title,
          description: META_BY_CODE[code].description,
        },
        ui: interior.ui,
        navItems: interior.navItems,
        footer: interior.footer,
        desktopMenuSections: homepageLocale.desktopMenuSections,
        navExploreLabel: homepageLocale.navExploreLabel,
        page: EVENT_APPLICATION_COPY[code],
        eventOptions: eventOptionsByLocale[code],
      };

      return [code, routeLocale];
    }),
  ) as Record<HomepageLocaleCode, EventApplicationRouteLocale>;

  return {
    siteSettings: homepageData.siteSettings,
    defaultLanguage: homepageData.defaultLanguage,
    defaultLocale: localizedContent[homepageData.defaultLanguage],
    localizedContent,
  };
}
