// This page is a static render for the application's "About Us" page.

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users, History, Lightbulb, SquareArrowUpRight, BookAlert } from "lucide-react";


export default function About() {
  return (
    <div className="flex flex-col p-6 max-w-5xl mx-auto">
      {/* Header */}
      <header className="text-center my-8">
        <h1 
        className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl text-gray-900 dark:text-gray-100 font-ZalandoSansExpanded"
        style={{ fontFamily: "'Zalando Sans Expanded', sans-serif" }}
        >
          About Us
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Creating an environment to foster learning, preservation and development of cultural artifacts.
        </p>
      </header>
      
      {/* --- Mission Section --- */}
      <Card className="shadow-xl mb-10 bg-primary text-primary-foreground">
        <CardContent className="p-8">
          <div className="flex items-center space-x-4">
            <SquareArrowUpRight className="w-12 h-12 flex-shrink-0" />
            <div>
              <h2 
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: "'Zalando Sans Expanded', sans-serif" }}
              >Core Objective</h2>
              <p className="text-lg">
                Make learning easy, intuitive, and accessile for everyone, everywhere.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>


        {/* Our Team */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl" style={{ fontFamily: "'Zalando Sans Expanded', sans-serif" }}>
              <SquareArrowUpRight className="w-6 h-6 mr-2 text-primary" />
              Our Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              • Clayton Houser
            </p>
            <p className="text-muted-foreground mb-4">
              • Khánh Giang "Gerald" Lê
            </p>
            <p className="text-muted-foreground mb-4">
              • William Morales
            </p>
            <p className="text-muted-foreground mb-4">
              • Hudson Vũ
            </p>
            <p className="text-muted-foreground mb-4">
              • Mujtaba Malik
            </p>
            <p className="font-medium">
              We are a team of LSU Computer Science undergraduate students who are establishing this project for a class assignment in Fall 2025.
            </p>
            
            
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl" style={{ fontFamily: "'Zalando Sans Expanded', sans-serif" }}>
              <BookAlert className="w-6 h-6 mr-2 text-primary" />
              Disclaimers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-semibold">Accessibility</p>
            <p className="text-muted-foreground pl-4">
              The program is in its first iterations and may not fully comply with all accessibility standards. We will work to improve that in future updates.
            </p>
             <p className="font-semibold">User-made content</p>
            <p className="text-muted-foreground pl-4">
              If there is any concerns regarding user-made content, please report via the email provided in the Contact Us section.
            </p>
             <p className="font-semibold">Use cases</p>
            <p className="text-muted-foreground pl-4">

              This is a project developed for academic purposes, under the guidance of Dr. Felipe Fronchetti at LSU. We are not liable for any misuse.
            </p>
            
          </CardContent>
        </Card>
      </div>

      {/* --- Team / Community Section (Placeholder) --- */}
      <Card className="shadow-lg mt-10">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl"
          style={{ fontFamily: "'Zalando Sans Expanded', sans-serif" }}>
            <Users className="w-6 h-12 mr-2 text-primary" />
            Contact Us
          </CardTitle>
          <CardDescription className="text-primary">
            <p className="text-muted-foreground mb-4 text-base">
              Please reach out to us at <a href="mailto:kle47@lsu.edu" className="text-primary underline"> this email</a> for all inquiries, questions, or feedback. Thank you!
            </p>
            <p className="text-muted-foreground mb-4 text-base">
              For further concerns, please contact Dr. Felipe Fronchetti at <a href="mailto:fronchetti@lsu.edu" className="text-primary underline"> this email</a>.
            </p>
          </CardDescription>
        </CardHeader>
      </Card>
      
    </div>
  );
}