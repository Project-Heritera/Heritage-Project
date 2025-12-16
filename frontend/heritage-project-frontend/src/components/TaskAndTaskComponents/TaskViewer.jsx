import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { update_task_progress } from "@/services/room";
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from "@radix-ui/react-dialog";
import Modal from "../Modal";
import BadgeAward from "../RoomsPage/BadgeAward";
import { taskComponentTypes } from "../../utils/taskComponentTypes";
import { CheckCircle, XCircle } from "lucide-react";
import TaskBase from "./TaskBase";
import statusTypes, { statusDisplayToKey } from "../../utils/statusTypes";
const TaskViewer = forwardRef(
  (
    {
      initialStatus,
      initialComponents = [],
      initialAttempts = 1,
      initialMetadata = {},
      taskID,
      badge_title,
      badge_image_url,
    },
    ref
  ) => {
    //do dynamically load tasks
    const [taskComponents, setTaskComponents] = useState(initialComponents);
    //specifics for viewer
    const [attempts, setAttempts] = useState(initialAttempts);
    const [metadata, setMetadata] = useState(initialMetadata);
    // NEW: No question component state
    const [noQuestionComponent, setNoQuestionComponent] = useState(false);
    // BADGE MODAL
    const [badgeAwardOpen, setBadgeAwardOpen] = useState(false);
    const navigate = useNavigate();

    // Normalize incoming status (accept either key like 'COMPLE' or display like 'COMPLETE')
    const getStatusKey = (s) => {
      if (!s) return null;
      // if s is already a key (e.g. 'COMPLE') and exists in statusTypes, return it
      if (Object.prototype.hasOwnProperty.call(statusTypes, s)) return s;
      // if s is a display string (e.g. 'COMPLETE'), map to key
      if (statusDisplayToKey && statusDisplayToKey[s])
        return statusDisplayToKey[s];
      return null;
    };

    // store canonical status key in state (e.g. 'COMPLE')
    const [taskStatus, setTaskStatusState] = useState(
      getStatusKey(initialStatus) ?? statusTypes.NOSTAR
    );

    // Expose a setter that accepts either display or key and normalizes to the canonical key
    const setTaskStatus = (val) => {
      const k = getStatusKey(val);
      if (k) setTaskStatusState(k);
    };
    //influences component behavior if no question task component is present in task
    const [questionTaskPresent, setQuestionTaskPresent] = useState(false);

    const onStaticTaskComponentComplete = async () => {
      try {
        const payload = { status: statusTypes.COMPLE };
        const room_complete = await update_task_progress(taskID, payload);
        setTaskStatus(statusTypes.COMPLE);
        if (room_complete) {
          setBadgeAwardOpen(true);
        }
      } catch {
        console.log("Failed to update task progress");
      }
    };

    //check if any task components are question types
    useEffect(() => {
      const questionTypes = Object.keys(taskComponentTypes).filter(
        (key) => taskComponentTypes[key].category === "Question"
      );
      const hasQuestion = taskComponents.some((tc) =>
        questionTypes.includes(tc.type)
      );
      setNoQuestionComponent(!hasQuestion);
    }, [taskComponents]);

    const contextValues = {
      taskStatus,
      setTaskStatus,
      badge_title,
      badge_image_url,
    };

    const questionProgressData = {
      attempts: attempts,
      status: taskStatus,
      metadata: metadata,
    };

    const renderContent = () => {
      const common = (
        <>
          <TaskBase
            components={taskComponents}
            isEditing={false}
            contextValues={contextValues}
            taskID={taskID}
            questionProgressData={questionProgressData}
          />

          {/* NEW CHECKBOX + MODAL */}
          {noQuestionComponent && (
            <>
              <div className="mt-4 flex items-center gap-2">
                <Button
                  disabled={taskStatus === statusTypes.COMPLE}
                  onClick={async () => {
                    if (taskStatus !== statusTypes.COMPLE) {
                      await onStaticTaskComponentComplete();
                    }
                  }}
                >
                  {taskStatus === statusTypes.COMPLE
                    ? "Completed"
                    : "Mark as Complete"}
                </Button>
              </div>
              <Dialog open={badgeAwardOpen} onOpenChange={setBadgeAwardOpen}>
                <DialogPortal>
                  <DialogOverlay className="fixed inset-0 bg-black/50 z-[1000]" />
                  <DialogContent className="fixed top-1/2 left-1/2 z-[1001] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white dark:bg-gray-800">
                    <DialogTitle></DialogTitle>

                    <BadgeAward
                      badge_title={badge_title}
                      badge_image_url={badge_image_url}
                      onClose={() => {
                        setBadgeAwardOpen(false);
                        if (window.history.length > 1) {
                          navigate(-1);
                        } else {
                          navigate("/courses");
                        }
                      }}
                    />
                  </DialogContent>
                </DialogPortal>
              </Dialog>
            </>
          )}
        </>
      );

      if (taskStatus === statusTypes.COMPLE) {
        return (
          <div className="relative pt-10">
            <div className="absolute top-2 right-2 flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-lg shadow-md text-sm font-semibold">
              <CheckCircle size={32} />
              Complete
            </div>
            {common}
          </div>
        );
      }

      if (taskStatus === statusTypes.INCOMP) {
        return (
          <div className="relative pt-10">
            <div className="absolute top-2 right-2 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-lg shadow-md text-sm font-semibold">
              <XCircle size={32} />
              Incorrect
            </div>
            {common}
          </div>
        );
      }

      return (
        <div className="relative pt-10">
          <div className="absolute top-2 right-2 flex items-center gap-2 bg-gray-400 text-white px-3 py-1 rounded-lg shadow-md text-sm font-semibold">
            Not Completed
          </div>
          {common}
        </div>
      );
    };
    return <div className="task-viewer">{renderContent()}</div>;
  }
);

export default TaskViewer;
