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
			res.redirect('/students');
	});
};

exports.updateStudentSummary = function(req,res,next){
	school_records.updateStudentSummary(req.query,function(err){
		if(err)
			next();
		else{
			res.redirect('/student/'+req.query.id);
		}
	});
};

exports.updateSubjectSummary = function(req,res,next){
	school_records.updateSubjectSummary(req.query,function(err){
		if(err)
			next();
		else
			res.redirect('/subjectSummary');
	});
};

exports.addStudent = function(req,res,next){
	school_records.addStudent(req.query,function(err){
		if(err)
			next();
		else
			res.redirect('/students');
	})
};

exports.addSubject = function(req,res,next){
	school_records.addSubject(req.query,function(err){
		if(err)
			next();
		else
			res.redirect('/students');
	})
};

exports.subjectSummaryBySubjectName = function(req,res,next){
	school_records.subjectSummaryBySubjectName(req.params.id,function(err,scoreData){
		if(!scoreData)
			next();
		else
			res.render('subjectSummaryBySubjectName',{scoreData:scoreData});
	})
};

exports.addScore = function(req,res,next){
	school_records.addScore(req.query,function(err){console.log(req.query);
		if(err)
			next();
		else{
			 res.redirect("/subjectSummaryBySubjectName/"+req.query.subject);
		}
	});
};

exports.classSummary = function(req,res,next){
	school_records.classSummary(req.params.class_id,function(err,classData){
		if(!classData)
			next();
		else
			res.render('classSummary',{classData:classData});
	});
};