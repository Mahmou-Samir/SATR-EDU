import ExamTakeView from "@/components/ExamTakeView";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ExamTakePage({ params }: PageProps) {
  const { id } = await params;
  return <ExamTakeView examId={id} />;
}
