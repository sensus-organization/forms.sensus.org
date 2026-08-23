"use client";

import { getFormattedErrorMessage } from "@/lib/utils/helper";
import { replaceHeadlineRecall } from "@/lib/utils/recall";
import { isSurveyResponsePresentAction, sendLinkSurveyEmailAction } from "@/modules/survey/link/actions";
import { Button } from "@/modules/ui/components/button";
import { FormControl, FormError, FormField, FormItem } from "@/modules/ui/components/form";
import { Input } from "@/modules/ui/components/input";
import { StackedCardsContainer } from "@/modules/ui/components/stacked-cards-container";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslate } from "@tolgee/react";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";
import { z } from "zod";
import { TProjectStyling } from "@formbricks/types/project";
import { TSurvey } from "@formbricks/types/surveys/types";

interface VerifyEmailProps {
  survey: TSurvey;
  isErrorComponent?: boolean;
  singleUseId?: string;
  styling: TProjectStyling;
  locale: string;
}

const ZVerifyEmailInput = z.object({
  email: z.string().email(),
});
type TVerifyEmailInput = z.infer<typeof ZVerifyEmailInput>;

export const VerifyEmail = ({ survey, isErrorComponent, singleUseId, styling, locale }: VerifyEmailProps) => {
  const { t } = useTranslate();
  const form = useForm<TVerifyEmailInput>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(ZVerifyEmailInput),
  });
  const localSurvey = useMemo(() => {
    return replaceHeadlineRecall(survey, "default");
  }, [survey]);

  const { isSubmitting } = form.formState;
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const submitEmail = async (emailInput: TVerifyEmailInput) => {
    const email = emailInput.email.toLowerCase();
    if (localSurvey.isSingleResponsePerEmailEnabled) {
      const actionResult = await isSurveyResponsePresentAction({
        surveyId: localSurvey.id,
        email,
      });
      if (actionResult?.data) {
        form.setError("email", {
          type: "custom",
          message: t("s.response_already_received"),
        });
        return;
      }
    }

    const data = {
      surveyId: localSurvey.id,
      email: email,
      surveyName: localSurvey.name,
      suId: singleUseId ?? "",
      locale,
    };

    const actionResult = await sendLinkSurveyEmailAction(data);
    if (actionResult?.data) {
      setEmailSent(true);
    } else {
      const errorMessage = getFormattedErrorMessage(actionResult);
      toast.error(errorMessage);
    }
  };

  const handleGoBackClick = () => {
    setEmailSent(false);
  };

  if (isErrorComponent) {
    return (
      <div className="flex h-[100vh] w-[100vw] flex-col items-center justify-center bg-slate-50">
        <span className="h-24 w-24 rounded-full bg-slate-300 p-6 text-5xl">🤔</span>
        <p className="mt-8 text-4xl font-bold">{t("s.this_looks_fishy")}</p>
        <Button variant="ghost" className="mt-4" onClick={handleGoBackClick}>
          {t("s.please_try_again_with_the_original_link")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center">
      <Toaster />
      <StackedCardsContainer
        cardArrangement={
          localSurvey.styling?.cardArrangement?.linkSurveys ??
          styling.cardArrangement?.linkSurveys ??
          "straight"
        }>
        <FormProvider {...form}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await form.handleSubmit(submitEmail)(e);
            }}>
            {!emailSent && (
              <div className="flex flex-col">
                <img
                  src="https://cdn.sensus.org/branding/logo-rgb.svg"
                  alt="SensUs"
                  className="mx-auto h-16"
                />
                <p className="mt-8 text-2xl font-bold lg:text-4xl">
                  {localSurvey.emailVerificationMessage?.heading ?? t("s.verify_email_before_submission")}
                </p>
                <p className="mt-4 text-sm text-slate-500 lg:text-base">
                  {localSurvey.emailVerificationMessage?.subheading ??
                    t("s.verify_email_before_submission_description")}
                </p>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState: { error } }) => (
                    <FormItem className="my-4 w-full space-y-4">
                      <FormControl>
                        <div>
                          <div className="flex space-x-2">
                            <Input
                              value={field.value}
                              onChange={(email) => {
                                field.onChange(email);
                              }}
                              type="email"
                              placeholder="engineering@acme.com"
                              className="h-10 bg-white"
                            />
                            <Button type="submit" size="sm" loading={isSubmitting}>
                              {t("s.verify_email_before_submission_button")}
                            </Button>
                          </div>
                          {error?.message && <FormError className="mt-2">{error.message}</FormError>}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </form>
        </FormProvider>
        {emailSent && (
          <div>
            <h1 className="mt-8 text-2xl font-bold lg:text-4xl">
              {t("s.survey_sent_to", { email: form.getValues().email })}
            </h1>
            <p className="mt-4 text-center text-sm text-slate-500 lg:text-base">
              {t("s.check_inbox_or_spam")}
            </p>
            <Button variant="secondary" className="mt-6" size="sm" onClick={handleGoBackClick}>
              <ArrowLeft />
              {t("common.back")}
            </Button>
          </div>
        )}
      </StackedCardsContainer>
    </div>
  );
};
