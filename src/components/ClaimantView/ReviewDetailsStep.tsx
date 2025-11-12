import { useAction, useMutation, useQuery } from "convex/react";
import { CircleCheck, Plus, X } from "lucide-react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigation, useClaimData } from "@/stores/claimantStore";
import { useUser } from "@/stores/userStore";
import { api } from "../../../convex/_generated/api";
import { Sparkles } from "../animate-ui/icons/sparkles";

const formSchema = z.object({
  amount: z
    .number({ message: "Amount is required" })
    .positive("Amount must be positive")
    .min(0.01, "Amount must be at least $0.01"),
  date: z
    .string({ message: "Date is required" })
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      return selectedDate <= today;
    }, "Date cannot be in the future"),
  parties: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Party name is required"),
      })
    )
    .min(1, "At least one party is required"),
});

type FormData = z.infer<typeof formSchema>;

export function ReviewDetailsStep() {
  const { email } = useUser();
  const { selectedDocument, backToDocumentSelect, completeAndReturnHome } = useNavigation();
  const { claimId, setClaimId } = useClaimData();

  const extractDetailsAction = useAction(api.ai.extractDocumentDetails);
  const evaluateClaim = useAction(api.ai.evaluateClaim);
  const submitClaim = useMutation(api.claims.submitClaim);
  const policyRules = useQuery(api.claims.getPolicyRules);

  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { errors, isSubmitting, isLoading, isSubmitSuccessful },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: async () => {
      if (!selectedDocument) {
        return {
          amount: 0,
          date: "",
          parties: [{ name: "" }],
        };
      }

      try {
        const details = await extractDetailsAction({
          documentType: selectedDocument.type,
          storageId: selectedDocument.storageId,
        });

        return {
          amount: details.amount,
          date: details.date,
          parties: details.parties.map((party: string) => ({ name: party })),
        };
      } catch (_error) {
        toast.error("Failed to extract document details");
        return {
          amount: 0,
          date: "",
          parties: [{ name: "" }],
        };
      }
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "parties",
  });

  const onSubmit = async (data: FormData) => {
    if (!(selectedDocument && email && policyRules)) {
      return;
    }

    try {
      const submissionData = {
        amount: data.amount,
        date: data.date,
        parties: data.parties.map((p) => p.name),
      };

      // First, evaluate the claim using AI
      const aiEvaluation = await evaluateClaim({
        extractedDetails: submissionData,
        policyRules,
      });

      // Then submit the claim with the evaluation
      const submittedClaimId = await submitClaim({
        claimantEmail: email,
        documentType: selectedDocument.type,
        storageId: selectedDocument.storageId,
        extractedDetails: submissionData,
        aiEvaluation,
      });
      setClaimId(submittedClaimId);
    } catch (_error) {
      toast.error("Failed to submit claim");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-3">
            <Sparkles loop animateOnView className="text-muted-foreground" />
            <span className="font-medium text-muted-foreground">
              Extracting data
            </span>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitSuccessful && claimId) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="mb-4 flex gap-1 text-green-800">
          <CircleCheck />
          <p className="font-bold">Claim Submitted Successfully!</p>
        </div>

        <p className="mb-6 text-gray-600">
          Your claim has been submitted with claim number:{" "}
          <span className="font-mono font-semibold">{claimId}</span>
        </p>
        <Button type="button" onClick={completeAndReturnHome}>
          Submit Another Claim
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="pr-4">
        <p className="mb-8 text-gray-600">
          Please review the extracted information and make any necessary
          corrections:
        </p>

        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4 rounded-lg border bg-white p-6">
          <Field>
            <FieldLabel htmlFor="document-type-input">Document Type</FieldLabel>
            <FieldContent>
              <Input
                id="document-type-input"
                type="text"
                value={selectedDocument?.name || ""}
                disabled
                className="bg-gray-50"
              />
            </FieldContent>
          </Field>

          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="amount-input">Amount ($)</FieldLabel>
                <FieldContent>
                  <Input
                    id="amount-input"
                    type="number"
                    step="0.01"
                    disabled={isSubmitting}
                    {...field}
                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                  />
                  <FieldError errors={errors.amount ? [errors.amount] : undefined} />
                </FieldContent>
              </Field>
            )}
          />

          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="date-input">Date</FieldLabel>
                <FieldContent>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                    disableFutureDates
                    placeholder="Select a date"
                  />
                  <FieldError errors={errors.date ? [errors.date] : undefined} />
                </FieldContent>
              </Field>
            )}
          />

          <div>
            <FieldLabel>Parties Involved</FieldLabel>
            <div className="mt-2 space-y-2">
              {fields.map((item, index) => (
                <Field key={item.id} orientation="horizontal">
                  <FieldContent>
                    <Controller
                      name={`parties.${index}.name`}
                      control={control}
                      render={({ field }) => (
                        <div className="flex gap-2">
                          <Input
                            {...field}
                            disabled={isSubmitting}
                            placeholder="Enter party name"
                            className="flex-1"
                          />
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => remove(index)}
                              disabled={isSubmitting}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    />
                    <FieldError 
                      errors={errors.parties?.[index]?.name ? [errors.parties[index].name] : undefined} 
                    />
                  </FieldContent>
                </Field>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "" })}
                disabled={isSubmitting}
                className="mt-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Party
              </Button>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <Button type="button" onClick={backToDocumentSelect} variant="outline" disabled={isSubmitting}>
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Claim"}
            </Button>
          </div>
        </form>
      </div>
    </ScrollArea>
  );
}
