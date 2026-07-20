import { getHomepageData } from "../homepage/reader";
import { HOMEPAGE_LOCALE_CODES, type HomepageLocaleCode } from "../homepage/types";
import { INTERIOR_LOCALES } from "../interior-pages/locales";
import {
  getProgramFormOptionsByLocale,
  type ProgramFormOption,
} from "../programs/reader";

import type { SiteSettings } from "../homepage/types";
import type { DesktopMenuSection } from "../homepage/types";
import type {
  InteriorFooterContent,
  InteriorNavItem,
  InteriorPageMeta,
  InteriorPageUi,
} from "../interior-pages/types";

export type EligibilityPageCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  selectedProgramLabel: string;
  sectionTitle: string;
  sectionSubtitle: string;
  fields: {
    program: string;
    programPlaceholder: string;
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

export type EligibilityRouteLocale = {
  meta: InteriorPageMeta;
  ui: InteriorPageUi;
  navItems: InteriorNavItem[];
  footer: InteriorFooterContent;
  desktopMenuSections: DesktopMenuSection[];
  navExploreLabel: string;
  page: EligibilityPageCopy;
  programOptions: ProgramFormOption[];
};

export type EligibilityPageData = {
  siteSettings: SiteSettings;
  defaultLanguage: HomepageLocaleCode;
  defaultLocale: EligibilityRouteLocale;
  localizedContent: Record<HomepageLocaleCode, EligibilityRouteLocale>;
};

const ELIGIBILITY_COPY: Record<HomepageLocaleCode, EligibilityPageCopy> = {
  EN: {
    eyebrow: "Program eligibility",
    title: "Check your eligibility",
    subtitle:
      "Tell us a little about your company and we'll confirm whether this program is the right fit.",
    selectedProgramLabel: "Selected program",
    sectionTitle: "Your details",
    sectionSubtitle: "This takes about a minute — no documents required.",
    fields: {
      program: "Program",
      programPlaceholder: "Select a program",
      name: "Name",
      namePlaceholder: "Your full name",
      email: "Email",
      emailPlaceholder: "you@company.com",
      company: "Company",
      companyPlaceholder: "Company name",
      message: "Short message",
      messagePlaceholder: "Briefly tell us about your company and why you're interested.",
    },
    submitLabel: "Check eligibility",
    submission: {
      submittingMessage: "Submitting...",
      successMessage: "Thanks — we've received your details and will be in touch.",
      errorMessage: "We could not submit the form. Please try again.",
      validationMessage: "Please complete the required fields.",
    },
  },
  BR: {
    eyebrow: "Elegibilidade do programa",
    title: "Verifique sua elegibilidade",
    subtitle:
      "Conte um pouco sobre sua empresa e confirmaremos se este programa e o ideal para voce.",
    selectedProgramLabel: "Programa selecionado",
    sectionTitle: "Seus dados",
    sectionSubtitle: "Leva cerca de um minuto — nenhum documento necessario.",
    fields: {
      program: "Programa",
      programPlaceholder: "Selecione um programa",
      name: "Nome",
      namePlaceholder: "Seu nome completo",
      email: "Email",
      emailPlaceholder: "voce@empresa.com",
      company: "Empresa",
      companyPlaceholder: "Nome da empresa",
      message: "Mensagem breve",
      messagePlaceholder: "Conte brevemente sobre sua empresa e por que tem interesse.",
    },
    submitLabel: "Verificar elegibilidade",
    submission: {
      submittingMessage: "Enviando...",
      successMessage: "Obrigado — recebemos seus dados e entraremos em contato.",
      errorMessage: "Nao foi possivel enviar o formulario. Tente novamente.",
      validationMessage: "Preencha os campos obrigatorios.",
    },
  },
  CN: {
    eyebrow: "项目资格",
    title: "检查您的资格",
    subtitle: "简单介绍一下您的公司，我们将确认该项目是否适合您。",
    selectedProgramLabel: "已选项目",
    sectionTitle: "您的信息",
    sectionSubtitle: "大约需要一分钟——无需任何文件。",
    fields: {
      program: "项目",
      programPlaceholder: "选择一个项目",
      name: "姓名",
      namePlaceholder: "您的全名",
      email: "邮箱",
      emailPlaceholder: "you@company.com",
      company: "公司",
      companyPlaceholder: "公司名称",
      message: "简短留言",
      messagePlaceholder: "简要介绍您的公司以及您感兴趣的原因。",
    },
    submitLabel: "检查资格",
    submission: {
      submittingMessage: "正在提交……",
      successMessage: "感谢——我们已收到您的信息，会尽快与您联系。",
      errorMessage: "无法提交表单，请重试。",
      validationMessage: "请填写必填字段。",
    },
  },
};

const META_BY_CODE: Record<HomepageLocaleCode, Omit<InteriorPageMeta, "htmlLang">> = {
  EN: {
    title: "Check Eligibility | LATAM China Tech",
    description: "Check whether a LATAM China Tech program is the right fit for your company.",
  },
  BR: {
    title: "Verificar Elegibilidade | LATAM China Tech",
    description: "Verifique se um programa da LATAM China Tech e ideal para sua empresa.",
  },
  CN: {
    title: "检查资格 | LATAM China Tech",
    description: "确认 LATAM China Tech 项目是否适合您的公司。",
  },
};

export async function getEligibilityPageData(): Promise<EligibilityPageData> {
  const [homepageData, programOptionsByLocale] = await Promise.all([
    getHomepageData(),
    getProgramFormOptionsByLocale(),
  ]);

  const localizedContent = Object.fromEntries(
    HOMEPAGE_LOCALE_CODES.map((code) => {
      const interior = INTERIOR_LOCALES[code];
      const homepageLocale = homepageData.localizedContent[code];

      const routeLocale: EligibilityRouteLocale = {
        meta: {
          htmlLang: interior.competitionsPage.meta.htmlLang,
          title: META_BY_CODE[code].title,
          description: META_BY_CODE[code].description,
        },
        ui: interior.ui,
        navItems: interior.navItems,
        footer: interior.footer,
        desktopMenuSections: homepageLocale.desktopMenuSections,
        navExploreLabel: homepageLocale.navExploreLabel,
        page: ELIGIBILITY_COPY[code],
        programOptions: programOptionsByLocale[code],
      };

      return [code, routeLocale];
    }),
  ) as Record<HomepageLocaleCode, EligibilityRouteLocale>;

  return {
    siteSettings: homepageData.siteSettings,
    defaultLanguage: homepageData.defaultLanguage,
    defaultLocale: localizedContent[homepageData.defaultLanguage],
    localizedContent,
  };
}
