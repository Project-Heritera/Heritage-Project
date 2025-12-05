import { useState,useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { useNavigate } from "react-router-dom";
import { update_task_progress } from "@/services/room";
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
    const Navigate = useNavigate();

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
      getStatusKey(initialStatus) ?? "NOSTAR"
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
        const payload = { status: "COMPLE" };
        const success = await update_task_progress(taskID, payload);
        setTaskStatus("COMPLE");

        if (success === true) {
          setBadgeAwardOpen(true);
        }
      } catch {
        console.log("Failed to update task progress");
      }
    };

    //check if any task components are question types
    useEffect(() => {
      const hasQuestion = taskComponents.some((tc) =>
        ["OPTION", "FILL", "MATCH"].includes(tc.type)
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
                  <input
                    type="checkbox"
                    id={`complete-${taskID}`}
                    onChange={async (e) => {
                      if (e.target.checked) {
                        await onStaticTaskComponentComplete();
                      }
                    }}
                  />
                  <label htmlFor={`complete-${taskID}`}>Mark as Complete</label>
                </div>

                <Modal
                  isOpen={badgeAwardOpen}
                  onClose={() => {
                    Navigate(-1);
                  }}
                >
                  <BadgeAward
                    badge_title={badge_title}
                    badge_image_url={badge_image_url}
                    onClose={() => {
                      Navigate(-1);
                    }}
                  />
                </Modal>
              </>
            )}
          </>
        );

        if (taskStatus === "COMPLE") {
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

        if (taskStatus === "INCOMP") {
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
      }
        return <div className="task-viewer">{renderContent()}</div>;
    }
);

export default TaskViewer;

