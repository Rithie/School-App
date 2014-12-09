var school_records = require('./school_records').init('./data/school.db');
exports.get_grades = function(req,res){
	school_records.getGrades(function(err,grades){
		res.render('grades',{grades:grades});
	});
};

exports.get_students = function(req,res){
	school_records.getStudentsByGrade(function(err,grades){
		res.render('students',{grades:grades});
	});
};

exports.get_subjects = function(req,res){
	school_records.getSubjectsByGrade(function(err,grades){
		res.render('subjects',{grades:grades});
	});
};

exports.get_subjectSummary = function(req,res){
	school_records.getSubjectSummary(function(err,subjectSummary){
		res.render('subjectSummary',{allSubjects:subjectSummary});
	});
};

exports.get_student = function(req,res,next){
	school_records.getStudentSummary(req.params.id,
	function(err,student){
		if(!student) 
			next();
		else 
			res.render('student',student);
	});
};

exports.updateGrade = function(req,res,next){
	school_records.update_Grade(req.query,function(err){
		if(err)
			next();
		else
			exports.get_students(req,res);
	});
};

exports.updateStudentSummary = function(req,res,next){
	school_records.updateStudentSummary(req.query,function(err){
		if(err)
			next();
		else{
			school_records.getStudentSummary(req.query.id,
				function(err,student){
				 res.render('student',student);
			});
		}
	});
};

exports.updateSubjectSummary = function(req,res,next){
	school_records.updateSubjectSummary(req.query,function(err){
		if(err)
			next();
		else
			exports.get_subjectSummary(req,res);
	});
};

exports.addStudent = function(req,res,next){
	school_records.addStudent(req.query,function(err){
		if(err)
			next();
		else
			exports.get_students(req,res);
	})
};

exports.addSubject = function(req,res,next){
	school_records.addSubject(req.query,function(err){
		if(err)
			next();
		else
			exports.get_students(req,res);
	})
};

exports.subjectSummaryBySubjectName = function(req,res,next){
	school_records.subjectSummaryBySubjectName(req.params.id,function(err,scoreData){
		console.log(scoreData);
		if(!scoreData)
			next();
		else
			res.render('subjectSummaryBySubjectName',{scoreData:scoreData});
	})
};

exports.addScore = function(req,res,next){
	school_records.addScore(req.query,function(err){
		if(err)
			next();
		else{
			school_records.subjectSummaryBySubjectName(req.query.subject,function(err,scoreData){
				res.render('subjectSummaryBySubjectName',{scoreData:scoreData});
			});
		}
	});
};

exports.classSummary = function(req,res,next){
	school_records.classSummary(req.params.class_id,function(err,classData){
		console.log(classData);
		if(!classData)
			next();
		else
			res.render('classSummary',{classData:classData});
	});
};