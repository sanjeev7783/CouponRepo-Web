import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Prashad Management System</h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Manage temple food offerings by meal times - breakfast, lunch, and dinner.
        </p>
        <Button asChild size="lg">
          <Link href="/admin">Go to Admin Portal</Link>
        </Button>
      </div>
    </div>
  )
}
