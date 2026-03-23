// This page serves as the landing and "About Us" page.
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Users,
  History,
  Lightbulb,
  SquareArrowUpRight,
  BookAlert,
} from "lucide-react";

export default function About() {
  return (
    <div className="flex flex-col p-6 max-w-5xl mx-auto">
      {/* Landing Header */}
      <header className="text-center my-12 flex flex-col items-center">
        <h1
          className="scroll-m-20 text-5xl font-bold tracking-tight lg:text-7xl text-gray-900 dark:text-gray-100 font-ZalandoSansExpanded mb-6"
          style={{ fontFamily: "'Zalando Sans Expanded', sans-serif" }}
        >
          Welcome to Heritera
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-8">
          Creating an environment to foster learning, preservation and
          development of cultural artifacts.
        </p>
        <div className="flex gap-4">
          <Link to="/login">
            <Button
              size="lg"
              className="w-56 text-2xl font-bold py-8 shadow-lg hover:scale-105 transition-transform duration-200 border-4 border-transparent"
            >
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button
              size="lg"
              variant="outline"
              className="w-56 text-2xl font-bold py-8 border-4 shadow-lg hover:scale-105 transition-transform duration-200"
            >
              Sign Up
            </Button>
          </Link>
        </div>
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
              >
                Core Objective
              </h2>
              <p className="text-lg">
                Provide the tools to save your dieing heritage and foster
                learning.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Our Team */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle
              className="flex items-center text-2xl"
              style={{ fontFamily: "'Zalando Sans Expanded', sans-serif" }}
            >
              <SquareArrowUpRight className="w-6 h-6 mr-2 text-primary" />
              Our Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium mb-4">
              <strong>Current Contributors:</strong>
              <br />
              <strong>
                <a
                  href="https://www.linkedin.com/in/mujtaba-malik-7b8442299/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  Mujtaba Malik
                </a>
              </strong>{" "}
              – Website feature development, frontend design, and backend
              maintenance
              <br />
              <strong>
                <a
                  href="https://www.linkedin.com/in/william-morales-0336aa240/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  William Morales
                </a>
              </strong>{" "}
              – Course content creation and database management
            </p>

            <p className="text-muted-foreground">
              <strong>Origins:</strong>
              <br />
              This project originated as a class assignment in a Fall 2025 LSU
              Computer Science course. The initial concept and early development
              were started by Clayton Houser, Hudson Vu, Khánh Giang “Gerald”
              Lê, Mujtaba Malik, and William Morales. After the course
              concluded, William Morales and Mujtaba Malik continued developing,
              maintaining, and expanding the project.
            </p>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle
              className="flex items-center text-2xl"
              style={{ fontFamily: "'Zalando Sans Expanded', sans-serif" }}
            >
              <BookAlert className="w-6 h-6 mr-2 text-primary" />
              Disclaimers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-semibold">Accessibility</p>
            <p className="text-muted-foreground pl-4">
              The program is in its first iterations and may not fully comply
              with all accessibility standards. We will work to improve that in
              future updates.
            </p>
            <p className="font-semibold">User-made content</p>
            <p className="text-muted-foreground pl-4">
              If there is any concerns regarding user-made content, please
              report via the email provided in the Contact Us section.
            </p>
            <p className="font-semibold">Use cases</p>
            <p className="text-muted-foreground pl-4">
              This is a project developed for academic purposes, under the
              guidance of Dr. Felipe Fronchetti at LSU. We are not liable for
              any misuse.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* --- Team / Community Section (Placeholder) --- */}
      <Card className="shadow-lg mt-10">
        <CardHeader>
          <CardTitle
            className="flex items-center text-2xl"
            style={{ fontFamily: "'Zalando Sans Expanded', sans-serif" }}
          >
            <Users className="w-6 h-12 mr-2 text-primary" />
            Contact Us
          </CardTitle>
          <CardDescription className="text-primary">
            <p className="text-muted-foreground mb-4 text-base">
              Please reach out to us at{" "}
              <a
                href="mailto:heriteraorg@gmail.com"
                className="text-primary underline"
              >
                {" "}
                this email
              </a>{" "}
              for all inquiries, questions, or feedback. Thank you!
            </p>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
