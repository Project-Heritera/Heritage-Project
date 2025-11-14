import PropTypes from "prop-types";
import "./CourseCard.css";

const CourseCard = ({ link, title, progress, imageLink }) => {
//Basically 
  const progressValue = Math.max(0, Math.min(1, progress || 0));
  const progressPercentage = Math.round(progressValue * 100);

  return (
    <a href={link} className="course-card-link">
      <div 
        className="course-container"
        style={{ backgroundImage: `url(${imageLink})` }}
      >
        <div className="course-progress-badge">
          In Progress - {progressPercentage}%
        </div>
        <div className="course-title-badge">
          {title}
        </div>
      </div>
    </a>
  );
};

CourseCard.propTypes = {
  link: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
  imageLink: PropTypes.string.isRequired,
};

export default CourseCard;

