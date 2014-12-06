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
		else
			exports.get_student(req,res,next);
	});
};